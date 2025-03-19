import React, { useEffect, useRef, useState } from 'react';
import { Wind, ShoppingBasket } from 'lucide-react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hairDryerRef = useRef<HTMLDivElement>(null);
  const [isBlowing, setIsBlowing] = useState(false);
  const [score, setScore] = useState(0);
  
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<any[]>([]);
  const animationFrameIdRef = useRef<number>(0);
  const isBlowingRef = useRef(false);

  useEffect(() => {
    isBlowingRef.current = isBlowing;
  }, [isBlowing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hairDryer = hairDryerRef.current;
    if (!canvas || !hairDryer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerSprite = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 30,
      color: '#3498db'
    };

    const basket = {
      x: canvas.width - 100,
      y: canvas.height - 80,
      width: 80,
      height: 60,
      color: '#8B4513'
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      gravity: number;
      friction: number;
      mass: number;
      collected: boolean;
      
      constructor(x: number, y: number, directionX: number, directionY: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = directionX * (Math.random() * 3 + 2);
        this.speedY = directionY * (Math.random() * 3 + 2);
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
        this.gravity = 0.05;
        this.friction = 0.99;
        this.mass = this.size * 0.1;
        this.collected = false;
      }
      
      update(mouseX: number, mouseY: number, isBlowing: boolean, basket: any) {
        if (this.collected) return;

        // Apply gravity
        this.speedY += this.gravity;
        
        // Handle blowing effect on existing particles
        if (isBlowing) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150;
            const angle = Math.atan2(dy, dx);
            
            this.speedX += Math.cos(angle) * force * 0.5;
            this.speedY += Math.sin(angle) * force * 0.5;
          }
        }
        
        // Apply friction
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Check basket collision
        if (
          this.x > basket.x &&
          this.x < basket.x + basket.width &&
          this.y > basket.y &&
          this.y < basket.y + basket.height
        ) {
          this.collected = true;
          setScore(prevScore => prevScore + Math.floor(this.size));
          return;
        }
        
        // Bounce off walls
        if (this.x < this.size) {
          this.x = this.size;
          this.speedX *= -0.5;
        }
        if (this.x > window.innerWidth - this.size) {
          this.x = window.innerWidth - this.size;
          this.speedX *= -0.5;
        }
        if (this.y < this.size) {
          this.y = this.size;
          this.speedY *= -0.5;
        }
        if (this.y > window.innerHeight - this.size) {
          this.y = window.innerHeight - this.size;
          this.speedY *= -0.5;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        if (this.collected) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const drawBasket = () => {
      if (!ctx) return;

      // Draw basket body
      ctx.fillStyle = basket.color;
      ctx.beginPath();
      ctx.moveTo(basket.x, basket.y);
      ctx.lineTo(basket.x + basket.width, basket.y);
      ctx.lineTo(basket.x + basket.width - 10, basket.y + basket.height);
      ctx.lineTo(basket.x + 10, basket.y + basket.height);
      ctx.closePath();
      ctx.fill();

      // Draw basket rim
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(basket.x, basket.y);
      ctx.lineTo(basket.x + basket.width, basket.y);
      ctx.stroke();

      // Draw basket pattern
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(basket.x + (basket.width * i / 4), basket.y);
        ctx.lineTo(basket.x + (basket.width * i / 4) - 5, basket.y + basket.height);
        ctx.stroke();
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseDown = () => {
      setIsBlowing(true);
    };

    const handleMouseUp = () => {
      setIsBlowing(false);
    };

    const drawCenterSprite = () => {
      if (!ctx) return;
      
      ctx.beginPath();
      ctx.arc(centerSprite.x, centerSprite.y, centerSprite.radius, 0, Math.PI * 2);
      ctx.fillStyle = centerSprite.color;
      ctx.fill();
      ctx.closePath();
    };

    const createParticles = () => {
      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      
      if (isBlowingRef.current) {
        const dx = centerSprite.x - mouseX;
        const dy = centerSprite.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const dirX = dx / distance;
          const dirY = dy / distance;
          
          const particleCount = Math.floor((1 - distance / 200) * 5) + 2;
          
          for (let i = 0; i < particleCount; i++) {
            const angle = Math.atan2(dirY, dirX) + (Math.random() * 0.5 - 0.25);
            const startX = centerSprite.x + Math.cos(angle) * centerSprite.radius;
            const startY = centerSprite.y + Math.sin(angle) * centerSprite.radius;
            
            particlesRef.current.push(new Particle(
              startX,
              startY,
              Math.cos(angle),
              Math.sin(angle)
            ));
          }
        }
      }
    };
    
    const handleParticles = () => {
      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].update(mouseX, mouseY, isBlowingRef.current, basket);
        particlesRef.current[i].draw(ctx);
      }
    };

    const updateHairDryerPosition = () => {
      if (hairDryer) {
        const { x, y } = mousePositionRef.current;
        hairDryer.style.left = `${x}px`;
        hairDryer.style.top = `${y}px`;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawCenterSprite();
      drawBasket();
      createParticles();
      handleParticles();
      updateHairDryerPosition();
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      centerSprite.x = canvas.width / 2;
      centerSprite.y = canvas.height / 2;
      
      basket.x = canvas.width - 100;
      basket.y = canvas.height - 80;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
      />
      <div 
        ref={hairDryerRef} 
        className={`absolute pointer-events-none ${isBlowing ? 'blowing' : ''}`}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          <div className="hairdryer-body bg-purple-600 w-16 h-20 rounded-lg flex items-center justify-center">
            <Wind className="text-white w-8 h-8" />
          </div>
          <div className="hairdryer-nozzle w-8 h-6 bg-purple-800 rounded-r-lg absolute -right-6 top-2" />
          <div className={`wind-effect ${isBlowing ? 'block' : 'hidden'} blowing-effect`} />
        </div>
      </div>
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
        <p className="text-xl font-bold">Score: {score}</p>
      </div>
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
        <p className="text-sm">Click and hold to blow particles off the ball!</p>
        <p className="text-xs mt-1 text-gray-300">Guide the particles into the basket to score points!</p>
      </div>
    </div>
  );
}

export default App;