/* ملف الجافاسكريبت الوحيد - جميع التوابع هنا */

// تحويل الأرقام العربية الهندية إلى أرقام إنكليزية
function toEnglishDigits(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code >= 1632 && code <= 1641) { result += String(code - 1632); }
        else if (code >= 1776 && code <= 1785) { result += String(code - 1776); }
        else { result += str.charAt(i); }
    }
    return result;
}

function showError(fieldId, message) {
    $("#err_" + fieldId).text(message);
    if (message !== "") { $("#" + fieldId).css("border-color", "#c0392b"); }
    else { $("#" + fieldId).css("border-color", "#999"); }
}

// الاسم: أحرف عربية فقط (اختياري)
function validateName() {
    var v = $.trim($("#fullname").val());
    if (v === "") { showError("fullname", ""); return true; }
    var re = /^[\u0621-\u064A]+(\s+[\u0621-\u064A]+)*$/;
    if (!re.test(v)) { showError("fullname", "الاسم يجب أن يحوي أحرفاً عربية فقط."); return false; }
    showError("fullname", ""); return true;
}

// الرقم الوطني: إلزامي، 11 خانة، أول خانتين بين 01 و14
function validateNationalId() {
    var v = toEnglishDigits($.trim($("#nationalid").val()));
    if (v === "") { showError("nationalid", "الرقم الوطني إلزامي."); return false; }
    if (!/^\d{11}$/.test(v)) { showError("nationalid", "الرقم الوطني يجب أن يتكون من 11 رقماً."); return false; }
    var prov = parseInt(v.substring(0, 2), 10);
    if (prov < 1 || prov > 14) { showError("nationalid", "أول خانتين يجب أن تكونا بين 01 و14 (المحافظة)."); return false; }
    showError("nationalid", ""); return true;
}

// تحويل نص yyyy-mm-dd إلى تاريخ (UTC) أو null إذا كان غير صالح
function parseDate(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toEnglishDigits($.trim(text)));
    if (m === null) { return null; }
    var y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) { return null; }
    return dt;
}

// تاريخا البداية والنهاية: إلزاميان، والنهاية لاحقة للبداية
function validateDates() {
    var ok = true;
    var sTxt = $.trim($("#startdate").val());
    var eTxt = $.trim($("#enddate").val());
    var s = null, e = null;
    if (sTxt === "") { showError("startdate", "تاريخ البداية إلزامي."); ok = false; }
    else {
        s = parseDate(sTxt);
        if (s === null) { showError("startdate", "الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح."); ok = false; }
        else { showError("startdate", ""); }
    }
    if (eTxt === "") { showError("enddate", "تاريخ النهاية إلزامي."); ok = false; }
    else {
        e = parseDate(eTxt);
        if (e === null) { showError("enddate", "الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح."); ok = false; }
        else { showError("enddate", ""); }
    }
    if (s !== null && e !== null && e.getTime() <= s.getTime()) {
        showError("enddate", "تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية."); ok = false;
    }
    return ok;
}

// الموبايل: Syriatel (093,098,099) أو MTN (094,095,096) - اختياري
function validateMobile() {
    var v = toEnglishDigits($.trim($("#mobile").val()));
    if (v === "") { showError("mobile", ""); return true; }
    var re = /^09(3|4|5|6|8|9)\d{7}$/;
    if (!re.test(v)) { showError("mobile", "الرقم يجب أن يبدأ بـ 093/098/099 (Syriatel) أو 094/095/096 (MTN) ويتكون من 10 أرقام."); return false; }
    showError("mobile", ""); return true;
}

// البريد الإلكتروني (اختياري)
function validateEmail() {
    var v = $.trim($("#email").val());
    if (v === "") { showError("email", ""); return true; }
    var re = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/;
    if (!re.test(v)) { showError("email", "صيغة البريد الإلكتروني غير صحيحة."); return false; }
    showError("email", ""); return true;
}

// جمع السيارات المختارة من الجدول
function getSelectedCars() {
    var cars = [];
    $("input.pick:checked").each(function () {
        var row = $(this).closest("tr");
        cars.push({
            code: row.find("td.code").text(),
            model: row.find("td.model").text(),
            price: parseInt(row.find("span.pricenum").text(), 10)
        });
    });
    return cars;
}

// حساب النتيجة وعرضها
function showResult() {
    var cars = getSelectedCars();
    var s = parseDate($("#startdate").val());
    var e = parseDate($("#enddate").val());
    var days = Math.round((e.getTime() - s.getTime()) / 86400000);
    var total = 0;
    var html = "<h2>ملخص الحجز</h2>";
    var name = $.trim($("#fullname").val());
    if (name !== "") { html += "<p>مقدم الطلب: " + name + "</p>"; }
    html += "<table><tr><th>السيارة</th><th>الأيام</th><th>المبلغ</th></tr>";
    for (var i = 0; i < cars.length; i++) {
        var sub = cars[i].price * days;
        total += sub;
        html += "<tr><td>" + cars[i].model + " (" + cars[i].code + ")</td><td>" + days + "</td><td>" + sub + " ل.س</td></tr>";
    }
    html += "</table>";
    var discount = 0;
    if (days > 7) { discount = total * 0.10; }
    var finalAmount = total - discount;
    html += "<p>عدد أيام التأجير: <b>" + days + "</b></p>";
    html += "<p>المجموع قبل الخصم: <b>" + total + " ل.س</b></p>";
    if (discount > 0) { html += "<p>الخصم (10% لتجاوز 7 أيام): <b>" + discount + " ل.س</b></p>"; }
    else { html += "<p>الخصم: لا يوجد (المدة 7 أيام أو أقل)</p>"; }
    html += "<p class='total'>المبلغ النهائي: " + finalAmount + " ل.س</p>";
    html += "<button type='button' id='closeresult'>إغلاق</button>";
    $("#resultbox").html(html);
    $("#overlay").fadeIn(300);
}

$(document).ready(function () {
    // ظهور تدريجي للمحتوى في كل الصفحات
    $("#content").hide().fadeIn(600);

    // زر الخروج
    $("#exitbtn").click(function () {
        if (confirm("هل تريد الخروج من الموقع؟")) {
            window.close();
            window.location.href = "about:blank";
        }
    });

    // إظهار/إخفاء تفاصيل السيارة (jQuery)
    $("input.showdetails").click(function () {
        var box = $("#details_" + $(this).val());
        var row = box.closest("tr");
        if ($(this).is(":checked")) { row.show(); box.slideDown(300); }
        else { box.slideUp(300, function () { row.hide(); }); }
    });

    // زر متابعة
    $("#continuebtn").click(function () {
        if (getSelectedCars().length === 0) {
            $("#carserror").text("الرجاء اختيار سيارة واحدة على الأقل.");
            return;
        }
        $("#carserror").text("");
        $("#bookingbox").slideDown(400);
        $("html, body").animate({ scrollTop: $("#bookingbox").offset().top }, 500);
    });

    // التحقق اللحظي عند مغادرة الحقل
    $("#fullname").blur(validateName);
    $("#nationalid").blur(validateNationalId);
    $("#startdate").blur(validateDates);
    $("#enddate").blur(validateDates);
    $("#mobile").blur(validateMobile);
    $("#email").blur(validateEmail);

    // إرسال النموذج
    $("#bookingform").submit(function (ev) {
        ev.preventDefault();
        var r1 = validateName();
        var r2 = validateNationalId();
        var r3 = validateDates();
        var r4 = validateMobile();
        var r5 = validateEmail();
        if (getSelectedCars().length === 0) { $("#carserror").text("الرجاء اختيار سيارة واحدة على الأقل."); return; }
        if (r1 && r2 && r3 && r4 && r5) { showResult(); }
    });

    $("#resultbox").on("click", "#closeresult", function () { $("#overlay").fadeOut(200); });
});
