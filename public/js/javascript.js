$(document).ready(function(){
    $('[data-toggle="popover"]').popover();
    // $('[data-toggle="tooltip"]').tooltip();   

    // $("#myTextArea").emojioneArea({
    //     pickerPosition: "bottom"
    // });
    
    $("#txtten").blur(function(){
        var alo = $( ".tt4" ).tooltip({placement: "left"});
        var ten = $(this).val();
        var regten = /^([A-Z]{1}[a-z]*\s)*([A-Z]{1}[a-z]*){1}$/;
        if(regten.test(ten)){
            $('#er4').css("color", "green"); 
            $('.tt4').tooltip('dispose'); 
            document.getElementById("er4").innerHTML ="✓";
            return true;
        }
        else{
            $('#er4').css("color", "red"); 
            $('.tt4').tooltip('show', alo);  
            document.getElementById("er4").innerHTML = "✘";
            return false;
        }
    });
    $("#fileUpload").on('change', function () {

        //Get count of selected files
        var countFiles = $(this)[0].files.length;
   
        var imgPath = $(this)[0].value;
        var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
        var image_holder = $("#image-holder");
        image_holder.empty();
   
        if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg") {
            if (typeof (FileReader) != "undefined") {
   
                //loop for each file selected for uploaded.
                for (var i = 0; i < countFiles; i++) {
   
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $("<img />", {
                            "src": e.target.result,
                                "class": "thumb-image"
                        }).appendTo(image_holder);
                    }
                    image_holder.show();
                    reader.readAsDataURL($(this)[0].files[i]);
                }
   
            } else {
                alert("This browser does not support FileReader.");
            }
        } else {
            alert("Hãy chọn một hình ảnh");
        }
    });

    // $('#txtphone').blur(function() {
    //     var regphone = /((0)+([0-9]{9})\b)/g;
    //     var phone = $(this).val();
    //     if(phone !==''){
    //         if (regphone.test(phone)) {
    //             $("#erphone").html("(*)");
    //             return true;
    //         }else{
    //             $("#erphone").html("Số điện thoại có 10 chữ số, bắt đầu bằng số 0");
    //             return false;
    //         }
    //     }else{
    //         $("#erphone").html("Bạn chưa điền số điện thoại");
    //         return false;
    //     }
    //     });
});


    
function ktraemail() {
    var alo1 = $( ".tt1" ).tooltip({placement: "left"});
    var regemail = /^(.+)@gmail.com$/
    var t = document.getElementById("email").value;
    if (t.length > 0 && t.length <= 30 && regemail.test(t)) {
        //dung
        $('#er1').css("color", "green"); 
        $('.tt1').tooltip('dispose'); 
        document.getElementById("er1").innerHTML ="✓";
        document.getElementById("btnDangki").disabled = true;
        return true;
    }
    else {
        // $('[data-toggle="tooltip1"]').tooltip('show');  
        $('#er1').css("color", "red"); 
        $('.tt1').tooltip('show', alo1);  
        document.getElementById("er1").innerHTML = "✘";
        document.getElementById("btnDangki").disabled = true;
        return false;
    }
}

function ktrausername() {
    var alo2 = $( ".tt2" ).tooltip({placement: "left"});
    var regusername = /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
    var t = document.getElementById("username").value;
    if (t.length > 0 && t.length <= 30 && regusername.test(t)) {
        //dung
        $('#er2').css("color", "green"); 
        $('.tt2').tooltip('dispose'); 
        document.getElementById("er2").innerHTML ="✓";
        document.getElementById("btnDangki").disabled = true;
        return true;
    }
    else {
        // $('[data-toggle="tooltip1"]').tooltip('show');  
        $('#er2').css("color", "red"); 
        $('.tt2').tooltip('show', alo2);  
        document.getElementById("er2").innerHTML = "✘";
        document.getElementById("btnDangki").disabled = true;
        return false;
    }
}


function ktrapw() {
    var alo3 = $( ".tt3" ).tooltip({placement: "left"});
    // var regpw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    var regpw = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    var t = document.getElementById("password").value;
    if (t.length > 0 && regpw.test(t)) {
        //dung
        $('#er3').css("color", "green"); 
        $('.tt3').tooltip('dispose'); 
        document.getElementById("er3").innerHTML ="✓";
        document.getElementById("btnDangki").disabled = false;
        return true;
    }
    else {
        $('#er3').css("color", "red"); 
        $('.tt3').tooltip('show', alo3);  
        document.getElementById("er3").innerHTML = "✘";
        document.getElementById("btnDangki").disabled = true;
        return false;
    }
}

function ktrapw2() {
    var rong = "";
    var alo = $( ".tt3" ).tooltip({placement: "left"});
    var t = document.getElementById("password").value;
    var t2 = document.getElementById("confirmpassword").value;
    
    if(t2 == rong){
        document.getElementById("er3").innerHTML = "✘";
        $('#er3').css("color", "red"); 
        $('.tt3').tooltip('show', alo);
        return false;
    }
    else if (t == t2) {
        $('#er3').css("color", "green"); 
        $('.tt3').tooltip('dispose'); 
        document.getElementById("er3").innerHTML ="✓";
        return true;
    }
    else {
        $('#er3').css("color", "red"); 
        $('.tt3').tooltip('show', alo);  
        document.getElementById("er3").innerHTML = "✘";
        return false;
    }
}

// function ktraCMND() {
//     var alo = $( ".tt5" ).tooltip({placement: "left"});
//     var regusername = /^[0-9]{9}$/;
//     var t = document.getElementById("txtcmnd").value;
//     if (t.length > 0 && t.length <= 30 && regusername.test(t)) {
//         //dung
//         $('#er5').css("color", "green"); 
//         $('.tt5').tooltip('dispose'); 
//         document.getElementById("er5").innerHTML ="✓";
//         return true;
//     }
//     else {
//         // $('[data-toggle="tooltip1"]').tooltip('show');  
//         $('#er5').css("color", "red"); 
//         $('.tt5').tooltip('show', alo);  
//         document.getElementById("er5").innerHTML = "✘";
//         return false;
//     }
// }

function ktAddgroup(){
    var alo4 = $( ".tt4" ).tooltip({placement: "left"});
    var t = document.getElementById("name_group").value;
    if (t.length > 0) {
        //dung
        $('.tt4').tooltip('dispose'); 
        document.getElementById("btAddgroup").disabled = false;
        return true;
    }
    else {
        $('.tt4').tooltip('show', alo4);  
        document.getElementById("btAddgroup").disabled = false;
        return false;
    }
}