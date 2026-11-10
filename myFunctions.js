
function showError(id, msg) {
    $("#err_" + id).text(msg);
    if (msg == "") { $("#" + id).css("border-color", "#999999"); }
    else { $("#" + id).css("border-color", "#C0392B"); }
}
function isLeap(y) {
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}
function monthDays(y, m) {
    if (m == 2) { if (isLeap(y)) { return 29; } return 28; }
    if (m == 4 || m == 6 || m == 9 || m == 11) { return 30; }
    return 31;
}
function dayNumber(text) {
    if (text.search(/^\d{4}-\d{2}-\d{2}$/) != 0) { return -1; }
    var ys = text.substring(0, 4);
    var ms = text.substring(5, 7);
    var ds = text.substring(8, 10);
    var y = parseInt(ys, 10);
    var m = parseInt(ms, 10);
    var d = parseInt(ds, 10);
    if (y < 1900 || m < 1 || m > 12 || d < 1 || d > monthDays(y, m)) { return -1; }
    var n = 0;
    for (var i = 1900; i < y; i++) {
        if (isLeap(i)) { n = n + 366; } else { n = n + 365; }
    }
    for (var k = 1; k < m; k++) { n = n + monthDays(y, k); }
    return n + d;
}
function checkName() {
    var v = $("#fullname").val();
    if (v != "" && v.search(/^[\u0621-\u064A ]+$/) != 0) {
        showError("fullname", "الاسم يجب أن يحوي أحرفاً عربية فقط.");
        return false;
    }
    showError("fullname", "");
    return true;
}
function checkId() {
    var v = $("#nationalid").val();
    if (v == "") { showError("nationalid", "الرقم الوطني إلزامي."); return false; }
    if (v.search(/^\d{11}$/) != 0) { showError("nationalid", "الرقم الوطني يجب أن يتكون من 11 رقماً."); return false; }
    var p = parseInt(v.substring(0, 2), 10);
    if (p < 1 || p > 14) { showError("nationalid", "أول خانتين يجب أن تكونا بين 01 و14 (المحافظة)."); return false; }
    showError("nationalid", "");
    return true;
}
function checkStart() {
    var v = $("#startdate").val();
    if (v == "") { showError("startdate", "تاريخ البداية إلزامي."); return false; }
    if (dayNumber(v) == -1) { showError("startdate", "الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح."); return false; }
    showError("startdate", "");
    return true;
}
function checkEnd() {
    var v = $("#enddate").val();
    if (v == "") { showError("enddate", "تاريخ النهاية إلزامي."); return false; }
    if (dayNumber(v) == -1) { showError("enddate", "الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح."); return false; }
    var s = dayNumber($("#startdate").val());
    if (s != -1 && dayNumber(v) <= s) { showError("enddate", "تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية."); return false; }
    showError("enddate", "");
    return true;
}
function checkMobile() {
    var v = $("#mobile").val();
    if (v != "" && v.search(/^09[3-689]\d{7}$/) != 0) {
        showError("mobile", "الرقم يجب أن يبدأ بـ 093/098/099 (Syriatel) أو 094/095/096 (MTN) ويتكون من 10 أرقام.");
        return false;
    }
    showError("mobile", "");
    return true;
}
function checkEmail() {
    var v = $("#email").val();
    if (v != "" && v.search(/^[^@ ]+@[^@ ]+\.[^@ .]+$/) != 0) {
        showError("email", "صيغة البريد الإلكتروني غير صحيحة.");
        return false;
    }
    showError("email", "");
    return true;
}
function showResult() {
    var picked = $("input.pick:checked");
    var days = dayNumber($("#enddate").val()) - dayNumber($("#startdate").val());
    var total = 0;
    var msg = "ملخص الحجز\n";
    if ($("#fullname").val() != "") { msg = msg + "مقدم الطلب: " + $("#fullname").val() + "\n"; }
    for (var i = 0; i < picked.length; i++) {
        var code = picked[i].value;
        var price = parseInt($("#p_" + code).text(), 10);
        var sub = price * days;
        total = total + sub;
        msg = msg + $("#m_" + code).text() + " (" + code + "): " + days + " يوم = " + sub + " ل.س\n";
    }
    var discount = 0;
    if (days > 7) { discount = total * 0.1; }
    msg = msg + "عدد أيام التأجير: " + days + "\n";
    msg = msg + "المجموع قبل الخصم: " + total + " ل.س\n";
    msg = msg + "الخصم (10% عند تجاوز 7 أيام): " + discount + " ل.س\n";
    msg = msg + "المبلغ النهائي: " + (total - discount) + " ل.س";
    alert(msg);
}

$(document).ready(function () {
    $("#bookingbox").css("display", "none");
    $("tr.details").css("display", "none");

    $("#exitbtn").click(function () {
        if (confirm("هل تريد الخروج من الموقع؟")) {
            window.close();
            window.location.href = "about:blank";
        }
        return false;
    });

    $("input.showdetails").click(function () {
        var row = $("#d_" + $(this).val());
        if (row.css("display") == "none") { row.css("display", "table-row"); }
        else { row.css("display", "none"); }
    });

    $("input.pick").click(function () {
        $("#r_" + $(this).val()).toggleClass("chosen");
    });

    $("#continuebtn").click(function () {
        if ($("input.pick:checked").length == 0) {
            $("#carserror").text("الرجاء اختيار سيارة واحدة على الأقل.");
        } else {
            $("#carserror").text("");
            $("#bookingbox").css("display", "block");
        }
    });

    $("#bookingform").submit(function () {
        var a = checkName();
        var b = checkId();
        var c = checkStart();
        var d = checkEnd();
        var e = checkMobile();
        var f = checkEmail();
        if ($("input.pick:checked").length == 0) {
            $("#carserror").text("الرجاء اختيار سيارة واحدة على الأقل.");
            return false;
        }
        if (a && b && c && d && e && f) { showResult(); }
        return false;
    });
});
