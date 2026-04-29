# Cinelix Frontend — Premium Movie Experience

Cinelix is a cutting-edge user interface built to redefine how users interact with cinematic entertainment. It combines high-end aesthetics with a fluid, responsive experience, featuring a custom "Cinematic Glass" design system and real-time seat synchronization.

## Core UI Features
- **Interactive Seat Map**: A high-fidelity, real-time seat selection interface with dynamic state updates via WebSockets.
- **Cinelix Wallet & Dashboard**: A premium personal space for managing wallet balances, membership perks, and booking history.
- **Cinelix+ Membership UI**: A dedicated experience for premium users featuring exclusive benefits and dynamic pricing indicators.
- **Fluid Micro-interactions**: Framer Motion and GSAP-powered transitions that provide immediate visual feedback and a "Premium" feel.
- **Responsive Layout**: A versatile interface optimized for seamless use across mobile, tablet, and desktop devices.
- **Real-Time Availability**: Instant visual updates when seats are locked or booked by other users.

## Technology Stack
| Component | Technology |
| :--- | :--- |
| **Framework** | React 18 with Vite |
| **Styling** | Tailwind CSS & Vanilla CSS with CSS Custom Properties |
| **Animations** | Framer Motion & GSAP |
| **Real-Time** | Socket.io-client |
| **API Client** | Axios with interceptor-ready configuration |
| **Icons** | Lucide React / FontAwesome |

## Project Structure
```text
src/
├── components/      # UI Components (SeatMap, MovieCard, Wallet, etc.)
├── pages/           # View Containers (Movies, Checkout, Profile, Admin)
├── context/         # Global State Management (Auth, Theme)
├── hooks/           # Custom React hooks for API and Socket logic
├── services/        # API service layer and WebSockets configuration
└── App.tsx          # Main application entry and routing logic
```

## Development Setup
### 1. Installation
```bash
git clone https://github.com/ayushkumarsinghh/cinelix-frontend.git
cd cinelix-frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```text
VITE_API_URL=http://localhost:5000
```

### 3. Execution
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## UI Highlights
### Distributed Seat State
The application utilizes **Socket.io** to bridge the gap between users. When a seat is selected, it is broadcasted across the network, ensuring the UI remains perfectly synchronized and preventing stale data interactions.

### Cinematic Theme Engine
The design system is built on **Tailwind CSS** and **CSS Variables**, allowing for deep aesthetic control. The interface prioritizes high contrast and cinematic imagery to keep the user immersed in the "Movie Going" experience.

## Conclusion
Cinelix Frontend is more than just a booking tool; it is a showcase of modern frontend capabilities. By prioritizing visual excellence and real-time performance, it lowers the barrier to entertainment booking, making the process as engaging as the movie itself.
