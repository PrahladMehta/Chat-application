import {BrowserRouter,Route,Routes} from "react-router-dom";
import Login from "./pages/Login"
import Chat from "./pages/Chat"
import Register from "./pages/Register";
import SetAvatar from "./pages/Setavatar";
function App() {
  return (
    <div className="App">

    <BrowserRouter>
      <Routes>
      <Route path="/login" element={<Login></Login>}> </Route>
      <Route path="/" element={<Chat></Chat>}></Route>
      <Route path="/register" element={<Register></Register>}></Route>
      <Route path="/setavatar" element={<SetAvatar/>}></Route>
      <Route path="*" element={<h1>404 Page not found</h1>}></Route>
      </Routes>      
    </BrowserRouter>
    
    </div>
  );
}

export default App;
