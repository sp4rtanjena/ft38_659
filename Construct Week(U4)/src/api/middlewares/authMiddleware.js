import jwt from 'jsonwebtoken'
import { userData } from '../../models/userModel.js'

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization
    const refreshToken = req.headers['x-refresh-token']

    if (!authHeader) {
        return res.status(401).json({ msg: "Unauthorized: No access token provided" })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await userData.findById(decoded.id)
        return next()
    } catch (err) {
        console.error('Error decoding JWT:', err) 
        if (err.name === 'TokenExpiredError' && refreshToken) {
            try {
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET)
                const user = await userData.findById(decodedRefresh.id)
                if (!user || user.refreshToken !== refreshToken) {
                    return res.status(401).json({ msg: "Unauthorized: Invalid refresh token" })
                }

                // Generate new access token
                const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '6h' })
                req.user = user
                req.user.accessToken = newAccessToken

                // Set new access token in response header
                res.setHeader('x-access-token', newAccessToken)
                return next()
            } catch (refreshErr) {
                return res.status(401).json({ msg: "Unauthorized: Invalid refresh token" })
            }
        } else {
            console.error('Invalid access token:', err)
            return res.status(401).json({ msg: "Unauthorized: Invalid access token" })
        }
    }
}


export { authMiddleware }