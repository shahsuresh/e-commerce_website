const validateReqBody = (validationSchema) => {
  return async (req, res, next) => {
    // extract new values from req.body
    const newData = req.body;
    // validate newData
    try {
      const validatedData = await validationSchema.validate(newData);
      req.body = validatedData;
    } catch (error) {
      //if validation fails, throw error
      return res.status(400).send({ message: error.message });
    }

    // call next function
    next();
  };
};

export default validateReqBody;
