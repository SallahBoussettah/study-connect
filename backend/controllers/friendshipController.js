const { User, Friendship } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all friends of the current user
 * @route   GET /api/friends
 * @access  Private
 */
exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all accepted friendships where the user is either the sender or receiver
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'friends',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'institution', 'major', 'bio'],
          through: { attributes: ['id', 'requestedAt'] }
        },
        {
          model: User,
          as: 'friendsOf',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'institution', 'major', 'bio'],
          through: { attributes: ['id', 'requestedAt'] }
        }
      ]
    });
    
    // Combine both friend lists
    const friends = [
      ...user.friends.map(friend => ({
        id: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        email: friend.email,
        avatar: friend.avatar,
        institution: friend.institution,
        major: friend.major,
        bio: friend.bio,
        friendshipId: friend.Friendship.id,
        since: friend.Friendship.requestedAt
      })),
      ...user.friendsOf.map(friend => ({
        id: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        email: friend.email,
        avatar: friend.avatar,
        institution: friend.institution,
        major: friend.major,
        bio: friend.bio,
        friendshipId: friend.Friendship.id,
        since: friend.Friendship.requestedAt
      }))
    ];
    
    res.status(200).json({
      success: true,
      data: friends
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    next(error);
  }
};

/**
 * @desc    Get all friend requests for the current user
 * @route   GET /api/friends/requests
 * @access  Private
 */
exports.getFriendRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get pending friend requests received by the user
    const pendingRequests = await Friendship.findAll({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });
    
    // Format the requests
    const formattedRequests = pendingRequests.map(request => ({
      id: request.id,
      sender: {
        id: request.sender.id,
        firstName: request.sender.firstName,
        lastName: request.sender.lastName,
        email: request.sender.email,
        avatar: request.sender.avatar
      },
      requestedAt: request.requestedAt
    }));
    
    res.status(200).json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    next(error);
  }
};

/**
 * @desc    Get all sent friend requests by the current user
 * @route   GET /api/friends/requests/sent
 * @access  Private
 */
exports.getSentFriendRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get pending friend requests sent by the user
    const sentRequests = await Friendship.findAll({
      where: {
        senderId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });
    
    // Format the requests
    const formattedRequests = sentRequests.map(request => ({
      id: request.id,
      receiver: {
        id: request.receiver.id,
        firstName: request.receiver.firstName,
        lastName: request.receiver.lastName,
        email: request.receiver.email,
        avatar: request.receiver.avatar
      },
      requestedAt: request.requestedAt
    }));
    
    res.status(200).json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    next(error);
  }
};

/**
 * @desc    Send a friend request to another user
 * @route   POST /api/friends/requests
 * @access  Private
 */
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;
    
    // Validate request
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        error: 'Receiver ID is required'
      });
    }
    
    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if trying to add self
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send friend request to yourself'
      });
    }
    
    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });
    
    if (existingFriendship) {
      return res.status(400).json({
        success: false,
        error: 'Friend request already exists or you are already friends'
      });
    }
    
    // Create friend request
    const friendship = await Friendship.create({
      senderId,
      receiverId,
      status: 'pending',
      requestedAt: new Date()
    });
    
    // Create notification for the receiver
    if (req.models && req.models.Notification) {
      await req.models.Notification.create({
        userId: receiverId,
        message: `${req.user.firstName} ${req.user.lastName} sent you a friend request`,
        type: 'info',
        link: '/dashboard/friends/requests',
        isRead: false,
        relatedId: friendship.id,
        relatedType: 'friendship'
      });
    }
    
    res.status(201).json({
      success: true,
      data: friendship
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    next(error);
  }
};

/**
 * @desc    Accept a friend request
 * @route   PUT /api/friends/requests/:id/accept
 * @access  Private
 */
exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;
    
    // Find the friend request
    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        receiverId: userId, // Ensure the current user is the receiver
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Friend request not found or already processed'
      });
    }
    
    // Update friendship status
    await friendship.update({ status: 'accepted' });
    
    // Create notification for the sender
    if (req.models && req.models.Notification) {
      await req.models.Notification.create({
        userId: friendship.senderId,
        message: `${req.user.firstName} ${req.user.lastName} accepted your friend request`,
        type: 'success',
        link: '/dashboard/friends',
        isRead: false,
        relatedId: friendship.id,
        relatedType: 'friendship'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: friendship.id,
        status: 'accepted',
        sender: {
          id: friendship.sender.id,
          firstName: friendship.sender.firstName,
          lastName: friendship.sender.lastName
        }
      }
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    next(error);
  }
};

/**
 * @desc    Reject a friend request
 * @route   PUT /api/friends/requests/:id/reject
 * @access  Private
 */
exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;
    
    // Find the friend request
    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        receiverId: userId, // Ensure the current user is the receiver
        status: 'pending'
      }
    });
    
    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Friend request not found or already processed'
      });
    }
    
    // Update friendship status
    await friendship.update({ status: 'rejected' });
    
    res.status(200).json({
      success: true,
      data: {
        id: friendship.id,
        status: 'rejected'
      }
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    next(error);
  }
};

/**
 * @desc    Remove a friend
 * @route   DELETE /api/friends/:id
 * @access  Private
 */
exports.removeFriend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.id;
    
    // Find the friendship
    const friendship = await Friendship.findOne({
      where: {
        status: 'accepted',
        [Op.or]: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      }
    });
    
    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Friendship not found'
      });
    }
    
    // Delete the friendship
    await friendship.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    next(error);
  }
};

/**
 * @desc    Search for users to add as friends
 * @route   GET /api/friends/search
 * @access  Private
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    // Get all existing friendships for the current user
    const existingFriendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      attributes: ['senderId', 'receiverId', 'status']
    });
    
    // Extract IDs of users who are already friends or have pending requests
    const existingUserIds = new Set();
    existingUserIds.add(userId); // Add current user to exclude from results
    
    existingFriendships.forEach(friendship => {
      existingUserIds.add(friendship.senderId);
      existingUserIds.add(friendship.receiverId);
    });
    
    // Search for users
    const users = await User.findAll({
      where: {
        id: {
          [Op.notIn]: Array.from(existingUserIds)
        },
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'institution', 'major'],
      limit: 10
    });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    next(error);
  }
}; 