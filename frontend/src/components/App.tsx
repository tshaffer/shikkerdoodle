import Login from "./Login";
import PhotoPicker from './PhotoPicker';
import ImageList from "./ImageList";

function App() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Login />
      <PhotoPicker />
      <ImageList />
    </div>
  );
}

export default App;
