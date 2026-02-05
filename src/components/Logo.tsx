import { Brain } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-button`}>
        <Brain className="w-2/3 h-2/3 text-primary-foreground" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-foreground`}>
          Parki<span className="text-primary">Sense</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
