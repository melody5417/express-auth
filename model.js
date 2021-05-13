const mongoose = require('mongoose')

// 默认端口号
mongoose.connect('mongodb://localhost:27017/express-learn', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})

const productSchema = new mongoose.Schema({
    title: {type: String}
})
const Product = mongoose.model('Product', productSchema);

module.exports = { Product }