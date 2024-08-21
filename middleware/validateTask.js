function validateTask(req, res, next) {
    const { name, status } = req.body;
    if (!name || !status) {
      return res.status(400).json({ error: 'Name and status are required.' });
    }
    next();
  }
  
 
  
  module.exports = { validateTask, checkTaskExists };
  