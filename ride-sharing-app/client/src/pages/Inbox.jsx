import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Search, Phone, Video, MoreVertical, ArrowLeft, MapPin, Calendar, Image, Smile, Paperclip, Mic } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SYSTEM_USER = {
  id: 'system',
  name: 'RideShare',
  avatar: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  role: 'system',
  lastActive: new Date(),
  location: 'System'
};

const SAMPLE_ACCOUNTS = [
  {
    id: '1',
    name: 'Divya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
    role: 'driver',
    lastActive: new Date(),
    location: 'Vizag'
  },
  {
    id: '2',
    name: 'Ravi Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    role: 'driver',
    lastActive: new Date(Date.now()),
    location: 'Hyderabad'
  },
  {
    id: '3',
    name: 'Sanjana',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60',
    role: 'driver',
    lastActive: new Date(Date.now() - 1000 * 60 * 45),
    location: 'Secunderabad'
  }
];

const defaultMessages = {
  system: [
    {
      id: '1',
      senderId: 'system',
      senderName: 'RideShare',
      content: 'Welcome to RideShare! Were excited to have you here. Find your perfect ride-sharing partner and start your journey today. If you need any help, just send us a message! 🚗✨',
      timestamp: new Date(),
      isSystem: true
    }
  ],
  '1': [
    {
      id: '2',
      senderId: '1',
      senderName: 'Divya',
      content: 'Hi! Im available for rides in the Gachibowli area. Need a lift?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isSystem: false
    }
  ],
  '2': [
    {
      id: '3',
      senderId: '2',
      senderName: 'Ravi Kumar',
      content: 'Looking for a ride share partner for daily commutes in Secunderabad!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isSystem: false
    }
  ],
  '3': [
    {
      id: '4',
      senderId: '3',
      senderName: 'Sanjana',
      content: 'Hey there! I do regular trips between secunderabad and Ameerpet. Let me know if youre interested!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isSystem: false
    }
  ]
};

function App() {
  const [messages, setMessages] = useState(defaultMessages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAccountList, setShowAccountList] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const allAccounts = [SYSTEM_USER, ...SAMPLE_ACCOUNTS];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAccount) return;

    const message = {
      id: Date.now().toString(),
      senderId: 'user',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [selectedAccount.id]: [...(prev[selectedAccount.id] || []), message]
    }));

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const responses = {
        system: 'Ill help you with any questions you have about RideShare! 🚗',
        '1': 'Thanks for reaching out! I usually drive around Gachibowli. When would you like to schedule a ride?',
        '2': 'Great to hear from you! Im always looking for ride share partners in Secunderabad.',
        '3': 'Perfect! I can definitely help with rides in the Ameerpet area. Whats your usual route?'
      };

      const responseMessage = {
        id: Date.now().toString(),
        senderId: selectedAccount.id,
        senderName: selectedAccount.name,
        content: responses[selectedAccount.id],
        timestamp: new Date()
      };

      setMessages(prev => ({
        ...prev,
        [selectedAccount.id]: [...prev[selectedAccount.id], responseMessage]
      }));
    }, 1500);

    setNewMessage('');
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    if (!messages[account.id]) {
      setMessages(prev => ({
        ...prev,
        [account.id]: []
      }));
    }
    if (isMobile) {
      setShowAccountList(false);
    }
  };

  const handleBackToList = () => {
    setShowAccountList(true);
  };

  const filteredAccounts = allAccounts.filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAccountList = () => (
    <div className="w-full md:w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-4">Messages</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredAccounts.map(account => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-2"
          >
            <div
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                selectedAccount?.id === account.id ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => handleAccountSelect(account)}
            >
              <div className="relative">
                <img
                  src={account.avatar}
                  alt={account.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white">{account.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    account.role === 'system' ? 'bg-purple-500' :
                    account.role === 'driver' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {account.role}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <MapPin size={14} className="mr-1" />
                  <p className="truncate">{account.location}</p>
                </div>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Calendar size={12} className="mr-1" />
                  <p>Active {formatDistanceToNow(account.lastActive, { addSuffix: true })}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderChat = () => {
    if (!selectedAccount) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4" />
            <p>Select an account to start chatting</p>
          </div>
        </div>
      );
    }

    const currentMessages = messages[selectedAccount.id] || [];

    return (
      <div className="flex-1 flex flex-col h-screen bg-gray-900">
        <div className="p-4 border-b border-gray-700 flex items-center">
          {isMobile && (
            <button
              onClick={handleBackToList}
              className="mr-4 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <img
            src={selectedAccount.avatar}
            alt={selectedAccount.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3 flex-1">
            <h2 className="font-semibold text-white">{selectedAccount.name}</h2>
            <p className="text-sm text-gray-400">
              {isTyping ? (
                <span className="text-green-400">typing...</span>
              ) : (
                selectedAccount.location
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="text-gray-400 hover:text-white transition-colors p-2 sm:p-0 rounded-full sm:rounded-none bg-gray-800 sm:bg-transparent">
              <Phone size={18} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors p-2 sm:p-0 rounded-full sm:rounded-none bg-gray-800 sm:bg-transparent">
              <Video size={18} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors p-2 sm:p-0 rounded-full sm:rounded-none bg-gray-800 sm:bg-transparent">
              <MoreVertical size={18} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 pb-20"
        >
          {currentMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.senderId === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isSystem
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {message.senderId !== 'user' && (
                  <p className="text-sm font-semibold mb-1">{message.senderName}</p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 border-t border-gray-700 bg-gray-800">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-4 pb-16 sm:pb-20">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Image size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Smile size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-2 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mic size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-2 sm:p-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!newMessage.trim() || !selectedAccount}
                style={{ minWidth: 36, minHeight: 36 }}
              >
                <Send size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      {(!isMobile || showAccountList) && renderAccountList()}
      {(!isMobile || !showAccountList) && renderChat()}
    </div>
  );
}

export default App;