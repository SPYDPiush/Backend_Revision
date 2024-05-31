export const asyncHandler = (handlerRequest) => {
  return (req, res, next) => {
    Promise.resolve(handlerRequest(req, res, next)).catch((err) => next(err));
  };
};

// ///////////////////// same code in try catch formate ////////////

// const asyncHandler = (fn) => async (req,res,next) =>{
//   try {

//     await fn(req,res,next)

//   } catch (err) {
//     res.status(err.code || 500).json({
//       success:false,
//       message : err.message
//     })

//   }
// }
