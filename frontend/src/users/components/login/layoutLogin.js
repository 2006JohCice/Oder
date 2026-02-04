import { Routes ,Route} from "react-router-dom";
import LoginPageUser from "./login";
import RegisterPageUser from "./register";
import LoginPageUserForgot from "./forgotPassword";
const LayoutLoginUser =() =>{

    return(
        <>
        <Routes>

            <Route path="/login" element={<LoginPageUser/>} />
            <Route path="/register" element={<RegisterPageUser/>} />
            <Route path="/forgot-password" element={<LoginPageUserForgot/>} />

        </Routes>
        </>
    )

}

export default LayoutLoginUser;