class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = "",
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null //ask chat gpt about this
        this.errors = errors
        this.success = false

        //ask chatgpt to explain the below code

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

export {ApiError}