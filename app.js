// Impor modul yang diperlukan
const express = require('express'); // Impor kerangka kerja Express
const mongoose = require('mongoose'); // Impor Mongoose untuk interaksi dengan MongoDB
const bodyParser = require('body-parser'); // Middleware untuk memparsing tubuh permintaan
const { Int32 } = require('mongodb');

// Membuat aplikasi Express
const app = express();

// Menetapkan port untuk server mendengarkan, menggunakan variabel lingkungan PORT atau default ke 3000
const PORT = process.env.PORT || 3000;

// Terhubung ke MongoDB
mongoose.connect('mongodb://localhost/pemilu-list-db'); // Terhubung ke database MongoDB

const db = mongoose.connection; // Dapatkan koneksi database

// Tangani kesalahan koneksi MongoDB
db.on('error', console.error.bind(console, 'Kesalahan koneksi MongoDB:')); // Merekam kesalahan koneksi
db.once('open', function () {
  console.log('Terhubung ke MongoDB'); // Merekam pesan ketika berhasil terhubung ke MongoDB
});

// Membuat skema mongoose untuk data Pemilu
const pemiluSchema = new mongoose.Schema({
  NAMA_PROV: { type: String, unique: true },
  NOMOR_01: Number,
  NOMOR_02: Number,
});


// Membuat model mongoose untuk Pemilu menggunakan skema
const Pemilu = mongoose.model('pemilu', pemiluSchema);

// Menyiapkan EJS sebagai mesin tampilan dan menggunakan middleware body-parser
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Mendefinisikan rute untuk merender tampilan utama
app.get('/', async (req, res) => {
  try {
    // Mengambil semua data Pemilu dari MongoDB dan merender templat 'view' dengan data tersebut
    const pemiluList = await Pemilu.find({});
    res.render('view', { pemiluList });
  } catch (error) {
    console.error(error);
    res.status(500).send('Kesalahan Server Internal'); // Menangani kesalahan dan mengirim kode status 500
  }
});

// Mendefinisikan rute untuk menangani pembuatan data Pemilu baru
app.post('/create', async (req, res) => {
  const { NAMA_PROV, NOMOR_01, NOMOR_02 } = req.body; // Ekstrak data dari tubuh permintaan

  try {
    // Membuat dokumen Pemilu baru di MongoDB jika NAMA_PROV belum ada
    const existingData = await Pemilu.findOne({ NAMA_PROV });
    if (existingData) {
      return res.status(400).send('Data dengan NAMA_PROV tersebut sudah ada'); // Menangani kesalahan data duplikat
    }

    // Jika NAMA_PROV belum ada, tambahkan data ke MongoDB dan arahkan ke tampilan utama
    await Pemilu.create({ NAMA_PROV, NOMOR_01, NOMOR_02 });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Kesalahan Server Internal'); // Menangani kesalahan dan mengirim kode status 500
  }
});


// Mendefinisikan rute untuk menangani penghapusan data Pemilu
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id; // Ekstrak parameter id dari permintaan

    try {
        // Temukan dan hapus dokumen Pemilu berdasarkan id-nya, lalu arahkan ke tampilan utama
        await Pemilu.findByIdAndDelete(id);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Kesalahan Server Internal'); // Menangani kesalahan dan mengirim kode status 500
    }
});

// Mendefinisikan rute untuk merender tampilan pengeditan untuk data Pemilu tertentu
app.get('/edit/:id', async (req, res) => {
    const id = req.params.id; // Ekstrak parameter id dari permintaan

    try {
        // Temukan dokumen Pemilu berdasarkan id-nya dan render templat 'edit' dengan data tersebut
        const pemilu = await Pemilu.findById(id);
        res.render('edit', { pemilu });
    } catch (error) {
        console.error(error);
        res.status(500).send('Kesalahan Server Internal'); // Menangani kesalahan dan mengirim kode status 500
    }
});

// Mendefinisikan rute untuk menangani pembaruan data Pemilu
app.post('/update/:id', async (req, res) => {
    const id = req.params.id; // Ekstrak parameter id dari permintaan
    const { NAMA_PROV, NOMOR_01, NOMOR_02 } = req.body; // Ekstrak data dari tubuh permintaan

    try {
        // Temukan dan perbarui dokumen Pemilu berdasarkan id-nya, lalu arahkan ke tampilan utama
        await Pemilu.findByIdAndUpdate(id, { NAMA_PROV, NOMOR_01, NOMOR_02 });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Kesalahan Server Internal'); // Menangani kesalahan dan mengirim kode status 500
    }
});

// Menjalankan server dan mendengarkan pada port yang ditentukan
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});