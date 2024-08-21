function checkTaskExists(req, res, next) {
    const tasks = JSON.parse(fs.readFileSync(path.join(__dirname, '../tasks.json')));
    const task = tasks.find(task => task.id === parseInt(req.params.id));
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    next();
  }

  module.exports = { checkTaskExists };
