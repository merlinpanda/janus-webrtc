import VideoRoom from './pages/VideoRoom';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoRoom />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
