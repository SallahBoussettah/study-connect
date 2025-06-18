import React from 'react';
import Modal from '../common/Modal';
import ResourceForm from './ResourceForm';

const ResourceModal = ({ isOpen, onClose, onSubmit, resource, loading, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (resource ? 'Edit Resource' : 'Add Resource')}
      size="lg"
    >
      <ResourceForm
        resource={resource}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
};

export default ResourceModal; 