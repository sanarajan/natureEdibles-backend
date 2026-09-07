const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://naturEdible_user:NatuReeDIBLE%40098@cluster0.y4qquty.mongodb.net/naturEdibles?retryWrites=true&w=majority&appName=naturEedibles-backend').then(() => {
    return mongoose.connection.collection('consultationbookings').updateOne(
        { fullName: 'gfdg' },
        { $set: { status: 'REJECTED', paymentStatus: 'PENDING' }, $unset: { rejectionReason: "" } }
    );
}).then(() => {
    console.log('Updated');
    process.exit(0);
});
