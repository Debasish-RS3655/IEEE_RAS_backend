
import User from "../models/User";

const authUser = async (username, password, done) => {
    
    const user = await User.findOne({ email: username });
    !user && done(null, false)

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).json("wrong password")

    //Search the user, password in the DB to authenticate the user
    //Let's assume that a search within your DB returned the username and password match for "Kyle".
    let authenticated_user = { id: 123, name: "Kyle" }
    return done(null, authenticated_user)
}

module.exports = authUser;