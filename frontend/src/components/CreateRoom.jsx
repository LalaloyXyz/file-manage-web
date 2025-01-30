import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const generateRoomId = () => Math.random().toString(36).substring(2, 8);

const CreateRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    const fetchUserRooms = async () => {
      const user = JSON.parse(localStorage.getItem("userInfo")) || {};
      const email = user.email?.trim().toLowerCase(); // Normalize email
      
      if (email) {
        try {
          const response = await axios.get("http://localhost:5001/api/user-rooms", {
            params: { email },
          });
          setUserRooms(response.data);
        } catch (error) {
          console.error("Error fetching user rooms:", error);
        }
      }
    };

    fetchRooms();
    fetchUserRooms();
  }, []);

  const createRoom = async () => {
    const room_code = generateRoomId();

    Swal.fire({
      title: "Room Created!",
      text: `Room ID: ${room_code}`,
      input: "text",
      inputPlaceholder: "Enter room name",
      showCancelButton: true,
      confirmButtonText: "Create Room",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const room_name = result.value;
        const user = JSON.parse(localStorage.getItem("userInfo")) || {};
        const create_by = user.email || "Guest";

        try {
          const response = await axios.post("http://localhost:5001/api/rooms", {
            room_code,
            room_name,
            create_by,
          });

          await axios.post("http://localhost:5001/api/user-rooms", {
            email: create_by,
            room_code: room_code,
          });

          navigate(`/room/${room_code}`);
        } catch (error) {
          console.error("Error creating room:", error);
        }
      }
    });
  };

  const searchRoom = async () => {
    Swal.fire({
      title: "Enter Room Code to Search",
      input: "text",
      inputPlaceholder: "Room Code",
      showCancelButton: true,
      confirmButtonText: "Search Room",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const room_code = result.value.trim();
        const user = JSON.parse(localStorage.getItem("userInfo")) || {};
        const email = user.email?.trim().toLowerCase();

        try {
          const response = await axios.get("http://localhost:5001/api/search-room", {
            params: { email, room_code },
          });

          if (response.data.length > 0) {
            Swal.fire({
              title: "Room Found!",
              text: `You can now join Room: ${response.data[0].room_name}`,
              icon: "success",
              confirmButtonText: "Join Room",
            }).then(() => {
              navigate(`/room/${response.data[0].room_code}`);
            });
          } else {
            await axios.post("http://localhost:5001/api/user-rooms", {
              email: email,
              room_code: room_code,
            });

            Swal.fire({
              title: "Room Not Found",
              text: "You are now added to the room!",
              icon: "success",
              confirmButtonText: "Join Room",
            }).then(() => {
              navigate(`/room/${room_code}`);
            });
          }
        } catch (error) {
          console.error("Error searching room:", error);
          Swal.fire({
            title: "Error",
            text: "An error occurred while searching for the room.",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      }
    });
  };

  const connectToRoom = (room_code) => {
    navigate(`/room/${room_code}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Create or Connect to a Room</h1>

      <button
        onClick={createRoom}
        className="px-4 py-2 mb-6 bg-blue-500 text-white rounded"
      >
        Create New Room
      </button>

      <button
        onClick={searchRoom}
        className="px-4 py-2 mb-6 bg-blue-500 text-white rounded"
      >
        Search for a Room
      </button>

      <h2 className="text-xl mb-2">Your Rooms:</h2>

      {rooms.length > 0 ? (
        <div className="space-y-2">
          {rooms
            .map((room) => (
              <div key={room.room_id}>
                <button
                  onClick={() => connectToRoom(room.room_code)}
                  className="px-4 py-2 bg-gray-300 text-black rounded w-full mb-2"
                >
                  {room.room_name} (ID: {room.room_code})
                </button>
              </div>
            ))}
        </div>
      ) : (
        <p>No rooms available. Create or join a room to get started!</p>
      )}
    </div>
  );
};

export default CreateRoom;