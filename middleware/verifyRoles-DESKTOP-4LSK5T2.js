function jwtDecode(t) {
    let token = {};
    token.raw = t;
    
    // Decode the base64Url encoded header and payload using Buffer
    const base64UrlDecode = (str) => {
        // Replace URL-safe characters (base64Url) with standard base64 characters
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        
        // Pad the string with "=" if necessary
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }
        
        return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    };

    // Split the JWT into its header, payload, and signature parts
    token.header = base64UrlDecode(t.split('.')[0]);
    token.payload = base64UrlDecode(t.split('.')[1]);

    return token;
}

const VerifyRoles = (...allowedRoles) => {
    return (req, res, next) => {

        const token = req.cookies.twj
        if(!token) return res.render('./system/ErrorPage', {code:"401 Unauthorized", message:"You must log in to view this content!"});

        const roles = jwtDecode(token).payload.UserInfo.roles

        if(!roles) return res.render('./system/ErrorPage', {code:"403 Forbidden", message:"Malformed user profile, you lack any roles! content a system admin."});
        const rolesArray = [...allowedRoles];
        const result = roles.map(role => rolesArray.includes(role)).find(val => val === true);

        if(!result) return res.render('./system/ErrorPage', {code:"401 Unauthorized", message:"You lack permission to view this resource"});
        next();
    }
}

module.exports = VerifyRoles