/*--Scroll It--*/

    $(function(){
        $.scrollIt({
            upKey: 38,             // key code to navigate to the next section
            downKey: 40,           // key code to navigate to the previous section
            easing: 'ease',      // the easing function for animation
            scrollTime: 600,       // how long (in ms) the animation takes
            activeClass: 'active', // class given to the active nav element
            onPageChange: null,    // function(pageIndex) that is called when page is changed
            topOffset: -56           // offset (in px) for fixed top navigation         
        });
    }); 

    // Variable to hold request
/*var request;
$("#newCustForm").submit(function(event){
    console.log()
}*/

$("#newCustForm").submit(function(event){
    // Abort any pending request
    if (request) {
        request.abort();
    }
    // setup some local variables
    var $form = $(this);

    // Let's select and cache all the fields
    var $inputs = $form.find("input, select, button, textarea");

    // Serialize the data in the form
    var serializedData = $form.serialize();

    // Let's disable the inputs for the duration of the Ajax request.
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop("disabled", true);

    // Fire off the request to /form.php
   request = $.ajax({
        url: "https://script.google.com/macros/s/AKfycbzx-O-ADZxHwMPdSwTrTxcQZySgRcil34iqdEmnZ77_DXyGNtU/exec",
        type: "post",
        data: serializedData
    });
    // Callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
        // Log a message to the console
        console.log("Hooray, it worked!");
    });

    // Callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // Log the error to the console
        console.error(
            "The following error occurred: "+
            textStatus, errorThrown
        );
    });

    // Callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
        // Reenable the inputs
        $inputs.prop("disabled", false);
    });

    // Prevent default posting of form
    event.preventDefault();
});

/*--page fade--*/

//$(document).ready(function() {
//       $(".ng-enter").hide(0).delay(100).fadeIn(1500);
//});


// $(".navbar-toggle").click(function() {
//    console.log('click');
// });



