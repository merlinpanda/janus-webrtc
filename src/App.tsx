import VideoRoom from './pages/VideoRoom';
import JanusTest from './pages/JanusTest';
import Test from './pages/Test'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoRoom />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
