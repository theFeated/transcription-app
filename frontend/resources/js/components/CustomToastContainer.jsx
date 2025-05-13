import { ToastContainer, toast } from 'react-toastify';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Custom Toast component to handle the "See More" button
const CustomToast = ({ closeToast, message, toastId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMessage = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="custom-toast-container">
      <div className="toast-message" style={{ maxHeight: isExpanded ? 'none' : '50px', overflow: 'hidden' }}>
        {message}
      </div>
      {!isExpanded && message.length > 100 && (
        <button className="see-more-btn" onClick={toggleMessage}>
          See More
        </button>
      )}
      {isExpanded && message.length > 100 && (
        <button className="see-more-btn" onClick={toggleMessage}>
          See Less
        </button>
      )}
    </div>
  );
};

const CustomToastContainer = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="colored"
      toastClassName="custom-toast"
      bodyClassName="custom-toast-body"
      render={(props) => <CustomToast {...props} />}
    />
  );
};

export default CustomToastContainer;
