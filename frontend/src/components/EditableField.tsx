import React from "react";

interface EditableFieldProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  viewContent: React.ReactNode;
  editContent: React.ReactNode;
  className?: string;
}

export default function EditableField({
  isEditing,
  onToggleEdit,
  onSave,
  onCancel,
  viewContent,
  editContent,
  className = "",
}: EditableFieldProps) {
  return (
    <div className={`editable-field ${className}`.trim()}>
      <button className="edit-icon-btn" onClick={onToggleEdit}>
        ✎
      </button>

      {isEditing ? (
        <div className="inline-edit-wrap">
          {editContent}
          <div className="inline-edit-actions">
            <button className="btn-primary" onClick={onSave}>
              Save
            </button>
            <button className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        viewContent
      )}
    </div>
  );
}
