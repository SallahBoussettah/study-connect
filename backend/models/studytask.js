'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StudyTask extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StudyTask.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  StudyTask.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dueDate: DataTypes.DATE,
    priority: DataTypes.STRING,
    estimatedTime: DataTypes.INTEGER,
    actualTime: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'StudyTask',
    tableName: 'study_tasks'
  });
  return StudyTask;
};