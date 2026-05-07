// ============= LocalStorage API =============
let localBookings = [];
let localWaiting = [];

const MAX_BOOKINGS_PER_DAY = 10;

// تحميل البيانات من LocalStorage
function loadLocalData() {
    const savedBookings = localStorage.getItem('salon_bookings');
    const savedWaiting = localStorage.getItem('salon_waiting');
    
    if (savedBookings) {
        localBookings = JSON.parse(savedBookings);
    } else {
        localBookings = [];
    }
    
    if (savedWaiting) {
        localWaiting = JSON.parse(savedWaiting);
    } else {
        localWaiting = [];
    }
}

// حفظ البيانات في LocalStorage
function saveLocalData() {
    localStorage.setItem('salon_bookings', JSON.stringify(localBookings));
    localStorage.setItem('salon_waiting', JSON.stringify(localWaiting));
}

// توليد الساعات
function generateTimeSlots() {
    return [
        "01:00 ظهراً", "02:00 مساءً", "03:00 مساءً", "04:00 مساءً",
        "05:00 مساءً", "06:00 مساءً", "07:00 مساءً", "08:00 مساءً",
        "09:00 مساءً", "10:00 مساءً", "11:00 مساءً",
        "12:00 منتصف الليل", "01:00 صباحاً"
    ];
}

// حساب السعر الإجمالي
function updateTotalPrice() {
    const checkboxes = document.querySelectorAll('.service-checkbox input:checked');
    let total = 0;
    checkboxes.forEach(cb => {
        const price = parseInt(cb.value.split('|')[1]);
        total += price;
    });
    const priceSpan = document.getElementById('totalPrice');
    if (priceSpan) priceSpan.textContent = total;
}

// جلب الخدمات المختارة
function getSelectedServices() {
    const checkboxes = document.querySelectorAll('.service-checkbox input:checked');
    const services = [];
    let total = 0;
    checkboxes.forEach(cb => {
        const [name, price] = cb.value.split('|');
        services.push(`${name} (${price}ج)`);
        total += parseInt(price);
    });
    return {
        services: services.length > 0 ? services.join(" - ") : "لم يحدد",
        total: total
    };
}

// عرض قوائم الانتظار
function displayWaitingQueues() {
    loadLocalData();
    
    const queues = {
        'عمرو': document.getElementById('queueAmr'),
        'يوسف': document.getElementById('queueYoussef'),
        'سعد': document.getElementById('queueSaad')
    };
    
    for (const [barber, queueList] of Object.entries(queues)) {
        if (!queueList) continue;
        
        const barberWaiting = localWaiting.filter(w => w.barber === barber);
        
        if (barberWaiting.length === 0) {
            queueList.innerHTML = '<li class="empty-msg">⭐ لا يوجد زبائن في الانتظار</li>';
        } else {
            queueList.innerHTML = barberWaiting.map((w, index) => 
                `<li>${index + 1}. ${w.name} - ${w.phone}</li>`
            ).join('');
        }
    }
}

// تحديث الساعات المتاحة (العمل الأساسي)
function updateAvailableTimes() {
    const barber = document.getElementById('barber').value;
    const date = document.getElementById('date').value;
    const timeSelect = document.getElementById('time');
    
    console.log("تحديث الساعات لـ:", barber, "التاريخ:", date);
    
    if (!date) {
        timeSelect.innerHTML = '<option value="">-- اختر التاريخ أولاً --</option>';
        return;
    }
    
    loadLocalData();
    
    // جلب الساعات المحجوزة لنفس الحلاق ونفس التاريخ
    const bookedTimes = localBookings
        .filter(b => b.barber === barber && b.date === date)
        .map(b => b.time);
    
    console.log("الساعات المحجوزة:", bookedTimes);
    
    const todayCount = localBookings.filter(b => b.barber === barber && b.date === date).length;
    const isFull = todayCount >= MAX_BOOKINGS_PER_DAY;
    
    const allTimes = generateTimeSlots();
    
    // تنظيف وتعبئة القائمة
    timeSelect.innerHTML = '<option value="">-- اختر الساعة --</option>';
    
    allTimes.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        
        if (bookedTimes.includes(time)) {
            // الساعة مشغولة
            option.textContent = `❌ ${time} (محجوز)`;
            option.disabled = true;
            option.style.color = '#ff8888';
            option.style.backgroundColor = '#330000';
        } else if (isFull) {
            // اليوم اكتمل
            option.textContent = `⏳ ${time} (اكتمل العدد)`;
            option.disabled = true;
            option.style.color = '#ffaa00';
            option.style.backgroundColor = '#332200';
        } else {
            // الساعة متاحة
            option.textContent = `✅ ${time} (متاح)`;
            option.style.color = '#d4af37';
            option.style.backgroundColor = '#1a1a1a';
        }
        timeSelect.appendChild(option);
    });
    
    console.log("تم تحديث قائمة الساعات");
}

// عرض رسالة
function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.style.display = 'block';
    setTimeout(() => {
        msg.style.display = 'none';
    }, 5000);
}

// حفظ حجز جديد
function saveNewBooking(bookingData) {
    loadLocalData();
    localBookings.push(bookingData);
    saveLocalData();
    return true;
}

// حفظ في قائمة الانتظار
function saveNewWaiting(waitingData) {
    loadLocalData();
    localWaiting.push(waitingData);
    saveLocalData();
    return true;
}

// تحديث كل البيانات
function refreshAllData() {
    loadLocalData();
    updateAvailableTimes();
    displayWaitingQueues();
}

// ملء قائمة الساعات الأولية
function populateTimeSelect() {
    const timeSelect = document.getElementById('time');
    const allTimes = generateTimeSlots();
    timeSelect.innerHTML = '<option value="">-- اختر الساعة --</option>';
    allTimes.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = `✅ ${time} (متاح)`;
        option.style.color = '#d4af37';
        option.style.backgroundColor = '#1a1a1a';
        timeSelect.appendChild(option);
    });
}

function setMinDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
}

// ============= الأحداث =============

// تحديث السعر
document.querySelectorAll('.service-checkbox input').forEach(cb => {
    cb.addEventListener('change', updateTotalPrice);
});

// حجز عادي
document.getElementById('bookBtn').addEventListener('click', async () => {
    const barber = document.getElementById('barber').value;
    const date = document.getElementById('date').value;
    const timeSelect = document.getElementById('time');
    const selectedIndex = timeSelect.selectedIndex;
    
    console.log("زر الحجز تم الضغط عليه");
    console.log("القيمة المختارة:", timeSelect.value);
    console.log("الفهرس المختار:", selectedIndex);
    
    if (selectedIndex === -1 || selectedIndex === 0) {
        showMessage("❌ من فضلك اختر ساعة من القائمة", "error");
        return;
    }
    
    const selectedOption = timeSelect.options[selectedIndex];
    
    if (selectedOption.disabled) {
        showMessage("❌ هذه الساعة غير متاحة (محجوزة أو مكتملة العدد)", "error");
        return;
    }
    
    const time = selectedOption.value;
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const { services: selectedServices, total: totalPrice } = getSelectedServices();
    
    if (!name || !phone) {
        showMessage("❌ أدخل الاسم ورقم الموبايل", "error");
        return;
    }
    if (!phone.match(/^01[0-9]{9}$/)) {
        showMessage("❌ رقم الموبايل غير صحيح (مثال: 01234567890)", "error");
        return;
    }
    if (selectedServices === "لم يحدد") {
        showMessage("❌ اختر خدمة واحدة على الأقل", "error");
        return;
    }
    
    loadLocalData();
    
    // التحقق من أن الوقت مش محجوز
    const isBooked = localBookings.some(b => 
        b.barber === barber && b.date === date && b.time === time
    );
    
    if (isBooked) {
        showMessage(`❌ عذراً، الساعة ${time} محجوزة بالفعل`, "error");
        refreshAllData();
        return;
    }
    
    // التحقق من عدد الحجوزات في اليوم
    const todayCount = localBookings.filter(b => b.barber === barber && b.date === date).length;
    if (todayCount >= MAX_BOOKINGS_PER_DAY) {
        showMessage(`❌ الحلاق ${barber} اكتمل عنده ${MAX_BOOKINGS_PER_DAY} حجوزات لهذا اليوم`, "error");
        return;
    }
    
    const bookingRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        name: name,
        phone: phone,
        barber: barber,
        date: date,
        time: time,
        services: selectedServices,
        total_price: totalPrice
    };
    
    const saved = saveNewBooking(bookingRecord);
    
    if (saved) {
        showMessage(`✅ تم الحجز مع ${barber} يوم ${date} الساعة ${time}`, "success");
        
        // رسالة واتساب
        const whatsappMessage = `مرحباً، أريد حجز موعد:
┌─────────────────────────┐
│ 👤 الاسم: ${name}
│ 📞 الموبايل: ${phone}
│ ✂️ الحلاق: ${barber}
│ 📅 التاريخ: ${date}
│ ⏰ الوقت: ${time}
│ 💇 الخدمات: ${selectedServices}
│ 💰 السعر: ${totalPrice} ج
└─────────────────────────┘`;
        
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/20100082336?text=${encodedMessage}`;
        
        // تنظيف الحقول
        document.getElementById('name').value = '';
        document.getElementById('phone').value = '';
        document.querySelectorAll('.service-checkbox input').forEach(cb => cb.checked = false);
        updateTotalPrice();
        refreshAllData();
        
        // فتح واتساب
        window.open(whatsappUrl, '_blank');
    } else {
        showMessage("❌ حدث خطأ في الحجز", "error");
    }
});

// إضافة لقائمة الانتظار
document.getElementById('waitingBtn').addEventListener('click', async () => {
    const barber = document.getElementById('barber').value;
    const date = document.getElementById('date').value;
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!name || !phone) {
        showMessage("❌ أدخل الاسم ورقم الموبايل", "error");
        return;
    }
    if (!phone.match(/^01[0-9]{9}$/)) {
        showMessage("❌ رقم الموبايل غير صحيح", "error");
        return;
    }
    
    const waitingRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        barber: barber,
        name: name,
        phone: phone,
        date: date
    };
    
    const added = saveNewWaiting(waitingRecord);
    
    if (added) {
        showMessage(`✅ تم إضافتك في قائمة انتظار ${barber} ليوم ${date}`, "success");
        document.getElementById('name').value = '';
        document.getElementById('phone').value = '';
        refreshAllData();
    } else {
        showMessage("❌ حدث خطأ", "error");
    }
});

// زر تصدير البيانات
const exportBtn = document.createElement('button');
exportBtn.textContent = "📥 تصدير البيانات (نسخة احتياطية)";
exportBtn.className = "gold-btn waiting-btn";
exportBtn.style.marginTop = "10px";
exportBtn.onclick = () => {
    loadLocalData();
    const data = {
        bookings: localBookings,
        waiting: localWaiting,
        exportDate: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salon_amr_backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("✅ تم تصدير البيانات", "success");
};
document.querySelector('.booking-card').appendChild(exportBtn);

// تغيير الحلاق أو التاريخ - تحديث الساعات فوراً
document.getElementById('barber').addEventListener('change', () => {
    console.log("تم تغيير الحلاق");
    updateAvailableTimes();
});

document.getElementById('date').addEventListener('change', () => {
    console.log("تم تغيير التاريخ");
    updateAvailableTimes();
    displayWaitingQueues();
});

// بدء التشغيل
populateTimeSelect();
setMinDate();
updateTotalPrice();
loadLocalData();
updateAvailableTimes();

console.log("✅ الموقع شغال! البيانات بتتخزن في LocalStorage");