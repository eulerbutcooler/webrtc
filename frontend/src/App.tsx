import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Sender } from "./components/Sender";
import { Receiver } from "./components/Receiver";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender></Sender>}></Route>
        <Route path="/receiver" element={<Receiver></Receiver>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
