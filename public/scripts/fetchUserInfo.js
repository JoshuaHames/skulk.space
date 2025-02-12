let isLoggedIn = false

function jwtDecode(t) {
    let token = {};
    token.raw = t;
    token.header = JSON.parse(window.atob(t.split('.')[0]));
    token.payload = JSON.parse(window.atob(t.split('.')[1]));
    return (token)
    }

function FetchUserInfo() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        isLoggedIn = false
        console.log("Not Logged in, no information to grab!")
        return;
    }
    isLoggedIn = true
    return jwtDecode(token).payload.UserInfo
}