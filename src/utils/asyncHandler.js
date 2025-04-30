const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err)) //If promise.catch means the application has met the error
    }
}



export {asyncHandler}

//this is example for try catch method
// The asyncHandler is the higher order function : - the meaning of that it accepts or return the function 
// example asHand = (fn) => {()=>{}} or bestPractise -> asynHand = (fn) => () => {}
/*

const asyncHandler = (fn) => async(req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success:false,
            message: err.message
        })
    }
}

 */
