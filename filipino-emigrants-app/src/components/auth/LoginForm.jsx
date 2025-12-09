import React, { useState } from 'react';
import { auth } from '../../firebase';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Your actual Firebase auth
      if (isLoginView) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        await auth.createUserWithEmailAndPassword(email, password);
      }
      
      // Success! Wait for redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #171d24 0%, #6b3481 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Glowing Shapes */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(240, 149, 170, 0.6) 0%, rgba(240, 149, 170, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(156, 45, 169, 0.7) 0%, rgba(156, 45, 169, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 10s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(193, 79, 158, 0.5) 0%, rgba(193, 79, 158, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        animation: 'pulse 6s ease-in-out infinite'
      }} />

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3000,
          flexDirection: 'column',
          color: 'white',
          gap: '20px'
        }}>
          <div style={{
            border: '8px solid #f3f3f3',
            borderTop: '8px solid #F095AA',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 1.5s linear infinite'
          }}></div>
          <h3>{isLoginView ? 'Logging in...' : 'Signing Up...'}</h3>
        </div>
      )}

      {/* Left Side - Giant Title */}
      <div style={{
        flex: '1.2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: 'clamp(48px, 7vw, 96px)',
          fontWeight: '900',
          color: '#ffffff',
          marginBottom: '24px',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          lineHeight: '1.1',
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          Filipino<br/>Emigrants<br/>Analytics
        </h1>

        <p style={{
          fontSize: '16px',
          fontWeight: '300',
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '0.05em',
          lineHeight: '1.6',
          maxWidth: '500px'
        }}>
          Tracing the journeys of a global diaspora through comprehensive data analysis and historical insights.
        </p>

        <div style={{
          display: 'flex',
          gap: '30px',
          marginTop: '40px'
        }}>
          <div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#F095AA'
            }}>10M+</div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Overseas Filipinos</div>
          </div>
          <div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#E17AA2'
            }}>200+</div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Countries Reached</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '50px 40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          width: '100%',
          maxWidth: '420px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#171d24',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '30px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {isLoginView ? 'Please log in to continue' : 'Create a new account'}
          </p>

          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 18px',
                marginBottom: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                background: isLoading ? '#f3f4f6' : 'white'
              }}
            />
            <input 
              type="password" 
              placeholder="Password (6+ characters)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 18px',
                marginBottom: '20px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                background: isLoading ? '#f3f4f6' : 'white'
              }}
            />
            
            {error && (
              <p style={{
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '15px',
                padding: '10px',
                background: '#fee2e2',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                border: 'none',
                borderRadius: '12px',
                background: isLoading 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #6b3481 0%, #9c2da9 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(107, 52, 129, 0.3)'
              }}
            >
              {isLoginView ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <p 
            onClick={() => !isLoading && setIsLoginView(!isLoginView)}
            style={{ 
              marginTop: '25px',
              color: '#6b3481',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(60px, -50px) scale(1.2);
          }
          66% {
            transform: translate(-40px, 40px) scale(0.85);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.8;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoginForm;