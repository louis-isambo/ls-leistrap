
const processNotReady = "the process is not ready"
class LeisError extends Error { }
class LeisProcessNotReady extends Error { }
class UniqueType extends Error { }

const errors = {
    LeisError,
    LeisProcessNotReady,
    UniqueType
}
const typeError = {
    listenerError: {
        exe: (type) => `type of ${typeof type} is not a callback function`
    },
    processNotReady: {
        name: processNotReady
    },
    uniqueTypeError: {
        exe: (type) => `the ${type.split(',')[0]} must be unique, the key ${type.split(',')[1]} already exists`
    }

}
/**
 * 
 * @param {'LeisError'|"LeisProcessNotReady"|"UniqueType"} error 
     * @param {'listenerError'|"processNotReady"|'uniqueTypeError' } message 
 */
function DisplayError(error, message, type) {
    throw new errors[error](typeError[message].exe(type))
}
export { DisplayError }