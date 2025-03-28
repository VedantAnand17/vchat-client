import { useEffect, useState, useRef } from 'react';
import './App.css';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

function App() {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const connectToRoom = () => {
    if (roomId.trim() === '') return;

    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join',
          payload: { roomId },
        })
      );
      setIsConnected(true);
    };
    wsRef.current = ws;
  };

  const sendMessage = () => {
    const messageInput = document.getElementById('messageInput') as HTMLInputElement | null;
    if (messageInput && messageInput.value.trim() !== '') {
      wsRef.current?.send(
        JSON.stringify({
          type: 'chat',
          payload: { message: messageInput.value },
        })
      );
      messageInput.value = ''; // Clear the input field after sending
    }
  };

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <h1 className='m-auto font-bold text-3xl font-mono md:text-6xl mt-20'>VCHAT FR</h1>
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Input
            className="placeholder-neutral-500 w-1/2 border-white border-2 p-8 rounded-lg"
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                connectToRoom();
              }
            }}
          />
          <Button
            className="bg-purple-600 hover:cursor-pointer hover:bg-purple-800 text-white p-8 rounded-lg"
            onClick={connectToRoom}
          >
            Join or Create Room
          </Button>
        </div>
      ) : (
        <div className="relative flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-24">
              {messages.map((message, index) => (
                <div key={index} className="">
                  <br />
                  <div className="bg-white text-black m-auto rounded-2xl p-4 min-h-15 w-[90vw] break-words">
                    {message}
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef}></div>
          </div>
          <div className="bg-black fixed bottom-0 left-0 w-full flex gap-5 p-4">
            <Input
              id="messageInput"
              className="placeholder-neutral-500 w-full border-white border-2 p-8 rounded-lg"
              type="text"
              placeholder="Enter text here"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <Button
              className="bg-purple-600 hover:cursor-pointer hover:bg-purple-800 text-white p-8 rounded-lg"
              onClick={sendMessage}
            >
              Send Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;