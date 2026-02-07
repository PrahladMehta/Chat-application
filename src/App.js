import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import SetAvatar from "./pages/Setavatar";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Chat />} />
            <Route path="/register" element={<Register />} />
            <Route path="/setavatar" element={<SetAvatar />} />
            <Route path="*" element={<h1>404 Page not found</h1>} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
