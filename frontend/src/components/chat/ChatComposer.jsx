import React from "react";

export default function ChatComposer({
  showMediaOptions,
  onToggleMediaOptions,
  onAddMedia,
  inputMessage,
  onInputChange,
  onKeyDown,
  isConnected,
}) {
  return (
    <div className="message-input-container">
      <div className="media-button-wrapper">
        <button className="add-media-btn" onClick={onToggleMediaOptions} title="Add media">
          +
        </button>
        {showMediaOptions && (
          <div className="media-options-menu">
            <button className="media-option" onClick={() => onAddMedia("image")}>
              Image
            </button>
            <button className="media-option" onClick={() => onAddMedia("video")}>
              Video
            </button>
            <button className="media-option" onClick={() => onAddMedia("file")}>
              File
            </button>
            <button className="media-option" onClick={() => onAddMedia("poll")}>
              Poll
            </button>
          </div>
        )}
      </div>
      <input
        type="text"
        value={inputMessage}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        className="text-input"
        disabled={!isConnected}
      />
    </div>
  );
}
