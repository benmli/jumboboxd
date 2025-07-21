import { Route, Switch } from "wouter";
import MovieList from "./components/MovieList";
import UserPage from "./components/UserPage";
import Navbar from "./components/Navbar";
import MovieDetails from "./components/MovieDetails";
import UserLibrary from "./components/UserLibrary";

const App = () => {
  return (
    <div className="font-serif min-h-screen bg-[#F2E8CF]">
      <Navbar />
      <Switch>
        <Route path="/" component={MovieList} />
        <Route path="/list/:id" component={MovieList} />
        <Route path="/users/:name" component={UserPage} />
        <Route path="/movie/:id" component={MovieDetails} />
        <Route path="/library" component={UserLibrary} />
        
        {/* Shows a 404 error if the path doesn't match anything */}
        {
          <Route>
            <p className="p-4">404: Page Not Found</p>
          </Route>
        }
      </Switch>
    </div>
  );
};

export default App;
