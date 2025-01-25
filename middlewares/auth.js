// the authentication check and the admin check for the user
// Debashish Bragohain

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: { message: 'Unauthorized access. Please log in.' } });
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    return res.status(403).json({ error: { message: 'Forbidden: Admins only.' } });
};

export { isAuthenticated, isAdmin };