import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedInUser = () => {
    const { user } = useUserAuth();
    const email = user?.email;
    const  phoneNumber = user?.phoneNumber;
    const [loggedInUser, setLoggedInUser] = useState({});

    useEffect(() => {
        if(!phoneNumber){
            fetch(`https://twitter-backend-main.onrender.com/loggedInUser?email=${email}`)
            .then(res => res.json()) 
            .then(data => {
               
                setLoggedInUser(data)
            })
        }
        else{
            fetch(`https://twitter-backend-main.onrender.com/loggedInUser?phoneNumber=${phoneNumber.replace("+", "")}`)
            .then(res => res.json()) 
            .then(data => {
                setLoggedInUser(data)
            })
        }
    }, [email])

    return [loggedInUser, setLoggedInUser];
}

export default useLoggedInUser