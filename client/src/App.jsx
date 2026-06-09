import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil";
import { Navbar, PrivateRoute } from "./components";
import {
  Home,
  Footer,
  Gig,
  Gigs,
  MyGigs,
  Add,
  Orders,
  Message,
  Messages,
  Login,
  Register,
  Pay,
  Success,
  NotFound,
  Profile,
} from "./pages";
import "./App.scss";

const paths = [
  { path: "/", element: <Home /> },
  { path: "/gig/:_id", element: <Gig /> },
  { path: "/gigs", element: <Gigs /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/orders",
    element: (
      <PrivateRoute>
        <Orders />
      </PrivateRoute>
    ),
  },
  {
    /* ИСПРАВЛЕНО ДЛЯ ВКР: Изменен роут с /organize на /add для устранения ошибки 404 */
    path: "/add",
    element: (
      <PrivateRoute>
        <Add />
      </PrivateRoute>
    ),
  },
  {
    path: "/my-gigs",
    element: (
      <PrivateRoute>
        <MyGigs />
      </PrivateRoute>
    ),
  },
  {
    path: "/message/:conversationID",
    element: (
      <PrivateRoute>
        <Message />
      </PrivateRoute>
    ),
  },
  {
    path: "/messages",
    element: (
      <PrivateRoute>
        <Messages />
      </PrivateRoute>
    ),
  },
  {
    path: "/pay/:_id",
    element: (
      <PrivateRoute>
        <Pay />
      </PrivateRoute>
    ),
  },
  {
    path: "/success",
    element: (
      <PrivateRoute>
        <Success />
      </PrivateRoute>
    ),
  },
  {
    /* ИСПРАВЛЕНО ДЛЯ ВКР: Защищенный роут для личного кабинета профиля */
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
];

function App() {
  const queryClient = new QueryClient();
  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Outlet />
        <Footer />
      </QueryClientProvider>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: paths.map(({ path, element }) => ({ path, element })),
    },
  ]);

  return (
    <div className="App">
      <RecoilRoot>
        <RouterProvider router={router} />
        <Toaster />
      </RecoilRoot>
    </div>
  );
}

export default App;
