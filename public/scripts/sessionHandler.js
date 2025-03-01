let userInfo = null

async function ValidateSession() {
    // Retrieve the token from localStorage
    let sessionVerified = false
    const token = localStorage.getItem("accessToken");
    if (!token) {
        return false;
    }

    try {
        const verify = await fetch('/verify', {
            method: "GET",
            headers: {
                authorization: 'Bearer ' + token
            }
        })
        if (verify.ok){
            return true;
        } else {
            sessionVerified = false
        }
    } catch {
        sessionVerified = false
    }

    if(!sessionVerified) {
        try {
            const response = await fetch("/refresh", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("accessToken", data.accessToken); // Store token in localStorage
                return true
            } else {
                localStorage.setItem("accessToken", null)
                return false
            }
        } catch (error) {
            localStorage.setItem("accessToken", null)
            return false
        }
    }

}

async function ValidateAdminRole(userRole) {
    // Retrieve the token from localStorage
    if(await !ValidateSession()) return false
    
    const token = localStorage.getItem("accessToken");
    try {
        const verifyRole = await fetch('/verifyadmin', {
            method: "GET",
            headers: {
                authorization: 'Bearer ' + token,
            }
        })
        if (verifyRole.ok){
            return true;
        } else {
            return false;
        }
    } catch {
        return false
    }
}

async function RedirectCheck(target, role){
    const isValidated = await ValidateSession();

    if(!isValidated) window.location.href = target;

}

async function ElevatedRoleCheck(target){

    await RedirectCheck(target);


    const isRoleVerified = await ValidateAdminRole()
    if(!isRoleVerified) window.location.href = target;

}

async function refreshSession(){
    try {
        const response = await fetch("/refresh", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("accessToken", data.accessToken);
            return true
        } else {
            localStorage.setItem("accessToken", null)
            return false
        }
    } catch (error) {
        localStorage.setItem("accessToken", null)
        return false
    }
}

let isLoggedIn = false

function jwtDecode(t) {
    let token = {};
    token.raw = t;
    token.header = JSON.parse(window.atob(t.split('.')[0]));
    token.payload = JSON.parse(window.atob(t.split('.')[1]));
    return (token)
    }

async function FetchUserInfo() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        isLoggedIn = false
        console.log("Not Logged in, no information to grab!")
        return;
    }
    isLoggedIn = true

    let name = jwtDecode(token).payload.UserInfo.username
    let response = await fetch("/quarryuserdetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"username": name})
    });

    if(response.ok){
        return response.json().then(data => {
            userInfo = data
        })
    }
}


if(ValidateSession()) {
    refreshSession();

    refreshCheck = setInterval(refreshSession, 10000);
}
