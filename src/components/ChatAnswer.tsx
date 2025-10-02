import { Paperclip } from "lucide-react";

type ChatAnswerProps = {
  text: string;
};

const ChatAnswer = ({ text }: ChatAnswerProps) => {
  return (
    <div 
      className="mb-8 max-w-fit mr-auto, bg-brand-green-bg/50"
      style={{
        borderRadius: '20px',
        padding: '20px 24px',
        maxWidth: '80%'
      }}
    >
      {/* Main message text */}
      <p 
        className="text-gray-900 leading-relaxed"
        style={{
          fontFamily: 'Manrope',
          fontSize: '16px',
          lineHeight: '24px',
          margin: 0
        }}
      >
        {text}
      </p>
    </div>
  );
};

export default ChatAnswer;