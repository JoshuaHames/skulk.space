function jwtDecode(t) {
    let token = {};
    token.raw = t;
    token.header = JSON.parse(window.atob(t.split('.')[0]));
    token.payload = JSON.parse(window.atob(t.split('.')[1]));
    return (token)
    }

async function fetchPage(accessRole) {
    // Retrieve the token from localStorage
    let verified = false
    const token = localStorage.getItem("accessToken");
    if (!token) {
        window.location.href = "/login";  // Redirect to login if no token is found
        return;
    }

    try {
        const verify = await fetch('/verify', {
            method: "GET",
            headers: {
                authorization: 'Bearer ' + token
            }
        })
        if (verify.ok){
            verified = true
        } else {
            verified = false
        }
    } catch {
        console.log("Something went wrong")
    }

    if(!verified) {
        console.log("Session has expired!")
        try {
            const response = await fetch("/refresh", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("accessToken", data.accessToken); // Store token in localStorage
                console.log("Refresh successful!");
            } else {
                localStorage.clear()
                errorMessage.textContent = "Please Login Again"
                window.location.href = "/login"; // Redirect to login
            }
        } catch (error) {
            localStorage.clear()
            errorMessage.textContent = "Session Has Expired"
            window.location.href = "/login"; // Redirect to login
        }
    }

    const rawInfo = jwtDecode(token).payload.UserInfo
    console.log(rawInfo.roles)
    if(!Object.values(rawInfo.roles).includes(accessRole) || !rawInfo){
        window.location.href = "/";  // Redirect to login if no token is found
        return;
    }
}