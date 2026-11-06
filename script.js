// Variable global untuk menyimpan keranjang
var keranjangTransaksi = [];

// Fungsi yang otomatis jalan saat halaman dimuat
window.onload = function() {
    initFormLogin();
    initTombolLogout();
    initModalProduk();
    initFiturCari();
    initTransaksiTabel();
};

/* =========================================================
   1. LOGIN & LOGOUT (SEDERHANA)
   ========================================================= */
function initFormLogin() {
    var formLogin = document.querySelector('.login-form');
    if (formLogin) {
        formLogin.onsubmit = function(event) {
            event.preventDefault(); // Mencegah reload halaman
            
            var user = document.getElementById('username').value;
            var pass = document.getElementById('password').value;

            if (user != "" && pass != "") {
                window.location.href = 'dashboard.html';
            } else {
                alert('Username dan Password harus diisi!');
            }
        };
    }
}

function initTombolLogout() {
    var btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.onclick = function(event) {
            event.preventDefault();
            var yakin = confirm('Apakah Anda yakin ingin keluar?');
            if (yakin) {
                window.location.href = 'login.html';
            }
        };
    }
}

/* =========================================================
   2. MODAL TAMBAH PRODUK (POP-UP)
   ========================================================= */
function initModalProduk() {
    var modal = document.getElementById('modalTambahProduk');
    var btnOpen = document.getElementById('btnOpenModal');
    var btnClose = document.getElementById('btnCloseModal');
    var formTambah = document.getElementById('formTambahProduk');

    if (btnOpen && modal) {
        btnOpen.onclick = function() {
            modal.className = "modal-overlay show";
        };
    }

    if (btnClose && modal) {
        btnClose.onclick = function() {
            modal.className = "modal-overlay";
        };
    }

    if (formTambah) {
        formTambah.onsubmit = function(event) {
            event.preventDefault();

            var nama = document.getElementById('namaProduk').value;
            var kategori = document.getElementById('kategoriProduk').value;
            var harga = document.getElementById('hargaProduk').value;
            var stok = document.getElementById('stokProduk').value;

            var tbody = document.getElementById('tabelProdukBody');
            if (tbody) {
                var noBaru = tbody.rows.length + 1;
                
                // Buat baris baru di tabel
                var row = tbody.insertRow();
                row.innerHTML = 
                    '<td>' + noBaru + '</td>' +
                    '<td>' + nama + '</td>' +
                    '<td>' + kategori + '</td>' +
                    '<td>Rp. ' + harga + '</td>' +
                    '<td>' + stok + '</td>' +
                    '<td><span class="status status-tersedia">Tersedia</span></td>' +
                    '<td class="action-links">' +
                        '<a href="#" class="btn-edit btn-tambah-item">Tambah</a> ' +
                        '<a href="#" class="btn-hapus">Hapus</a>' +
                    '</td>';
            }

            alert('Produk ' + nama + ' berhasil ditambahkan!');
            formTambah.reset();
            modal.className = "modal-overlay";
        };
    }
}

/* =========================================================
   3. PENCARIAN / FILTER DENGAN FOR LOOP
   ========================================================= */
function initFiturCari() {
    var inputCari = document.getElementById('searchInput');
    if (!inputCari) return;

    inputCari.onkeyup = function() {
        var kataKunci = inputCari.value.toLowerCase();
        var tabel = document.querySelector('.data-table tbody');
        if (!tabel) return;

        var barisTabel = tabel.getElementsByTagName('tr');

        for (var i = 0; i < barisTabel.length; i++) {
            var teksBaris = barisTabel[i].innerText.toLowerCase();
            if (teksBaris.indexOf(kataKunci) > -1) {
                barisTabel[i].style.display = "";
            } else {
                barisTabel[i].style.display = "none";
            }
        }
    };
}

/* =========================================================
   4. TRANSAKSI (KERANJANG & HAPUS PRODUK)
   ========================================================= */
function initTransaksiTabel() {
    var tabel = document.querySelector('.transaksi-left .data-table');
    if (!tabel) return;

    tabel.onclick = function(event) {
        var elemenKlik = event.target;
        
        // Cek jika yang diklik adalah link/tombol di dalam tabel
        if (elemenKlik.tagName === 'A') {
            event.preventDefault();
            
            // Ambil baris (tr) dari elemen yang diklik
            var row = elemenKlik.parentNode.parentNode;
            var namaProduk = row.cells[1].innerText.trim();
            var teksHarga = row.cells[3].innerText;
            
            // Mengubah format harga "Rp. 3.500" menjadi angka biasa 3500
            var hargaAngka = parseInt(teksHarga.replace(/[^0-9]/g, ''));

            if (elemenKlik.innerText === 'Tambah') {
                tambahProdukKeKeranjang(namaProduk, hargaAngka);
            } else if (elemenKlik.innerText === 'Hapus') {
                hapusProdukDariKeranjang(namaProduk);
            }
        }
    };

    var btnBayar = document.querySelector('.btn-bayar');
    if (btnBayar) {
        btnBayar.onclick = function() {
            if (keranjangTransaksi.length === 0) {
                alert('Keranjang belanja masih kosong!');
            } else {
                var total = 0;
                for (var i = 0; i < keranjangTransaksi.length; i++) {
                    total += keranjangTransaksi[i].harga * keranjangTransaksi[i].qty;
                }
                alert('Transaksi Berhasil! Total Pembayaran: Rp. ' + total.toLocaleString('id-ID'));
                
                // Reset keranjang
                keranjangTransaksi = [];
                updateTampilanKeranjang();
            }
        };
    }
}

// Fungsi Tambah Barang ke Keranjang
function tambahProdukKeKeranjang(nama, harga) {
    var ketemu = false;

    // Cek apakah barang sudah ada di keranjang pakai loop
    for (var i = 0; i < keranjangTransaksi.length; i++) {
        if (keranjangTransaksi[i].nama === nama) {
            keranjangTransaksi[i].qty += 1;
            ketemu = true;
            break;
        }
    }

    // Jika belum ada, masukkan sebagai item baru
    if (!ketemu) {
        keranjangTransaksi.push({
            nama: nama,
            harga: harga,
            qty: 1
        });
    }

    updateTampilanKeranjang();
}

// Fungsi Hapus Barang dari Keranjang
function hapusProdukDariKeranjang(nama) {
    var indeksDitemukan = -1;

    for (var i = 0; i < keranjangTransaksi.length; i++) {
        if (keranjangTransaksi[i].nama === nama) {
            indeksDitemukan = i;
            break;
        }
    }

    if (indeksDitemukan !== -1) {
        if (keranjangTransaksi[indeksDitemukan].qty > 1) {
            keranjangTransaksi[indeksDitemukan].qty -= 1; // Kurangi 1 jika lebih dari 1
        } else {
            keranjangTransaksi.splice(indeksDitemukan, 1); // Hapus item jika sisa 1
        }
        updateTampilanKeranjang();
    } else {
        alert('Produk "' + nama + '" belum ada di keranjang!');
    }
}

// Fungsi Render Ulang Tampilan Keranjang (Panel Kanan)
function updateTampilanKeranjang() {
    var listKeranjang = document.getElementById('cartItemsList');
    var textTotal = document.getElementById('textTotalHarga');

    if (!listKeranjang) return;

    listKeranjang.innerHTML = ''; // Kosongkan elemen HTML
    var totalBayar = 0;

    if (keranjangTransaksi.length === 0) {
        if (textTotal) textTotal.innerText = '';
        return;
    }

    // Tampilkan data keranjang menggunakan perulangan standard (for)
    for (var i = 0; i < keranjangTransaksi.length; i++) {
        var item = keranjangTransaksi[i];
        var subtotal = item.harga * item.qty;
        totalBayar += subtotal;

        var teksJumlah = item.qty > 1 ? ' (' + item.qty + 'x)' : '';

        var li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = 
            '<span>' + item.nama + teksJumlah + '</span>' +
            '<span>Rp. ' + subtotal.toLocaleString('id-ID') + '</span>';

        listKeranjang.appendChild(li);
    }

    if (textTotal) {
        textTotal.innerText = 'Rp. ' + totalBayar.toLocaleString('id-ID');
    }
}