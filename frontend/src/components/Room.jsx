import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const backToMain = () => {
    navigate('/');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl">Welcome to Room: {id}</h1>
      <div className="mt-4">
        <button
          onClick={backToMain}
          className="px-4 py-2 bg-gray-500 text-white rounded mr-4"
        >
          Back to Main
        </button>
      </div>
    </div>
  );
};

export default Room;