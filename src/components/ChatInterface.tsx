import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageSquare, Send, Loader2 } from "lucide-react";



interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  sendChatMessage: () => void;
  loading: { [key: string]: boolean };
}

export default function ChatInterface({
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  loading
}: ChatInterfaceProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare size={24} />
          Chat with AI Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading.chat && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm text-gray-600">Coach is typing...</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your fitness coach anything..."
              className="flex-1 border-2 focus:border-indigo-500"
              disabled={loading.chat}
            />
            <Button 
              onClick={sendChatMessage} 
              disabled={loading.chat || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading.chat ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}