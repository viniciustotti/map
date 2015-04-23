var firstAttempt;

$(document).on("pageinit", "#pagMenu", function () {
    closeModal();
    firstAttempt = true;
    listarMenu();

    if (isIphone()) {
        $(".iphone-tollbar").show();
    }
});

function onSuccessListarMenu(data) {
    var itemMenu = '';
    $.each(data, function (index, value) {
        itemMenu += '<li class="ui-icon-arrow-r ui-btn-icon-right" onclick="redirecionaLista(\''
			+ value.codigo + '\', \'' + value.descricao + '\')">'
            + '<a data-transition="slide" href="#">'
			+ value.descricao
			+ '</a></li>';
    });

    $('.box-menu').append(itemMenu);
    $('.box-menu').trigger('create');
    firstAttempt = false;
    hideLoading();
}

function onErrorListarMenu(jqXHR, textStatus, errorThrown) {
    if (firstAttempt) {
        firstAttempt = false;
        listarMenu();
    } else {
        msgServicoIndisponivel(jqXHR, $(".btn-primary").last());
        hideLoading();
    }
}

function listarMenu() {
    setTimeout(function () {
        showLoading();
        $.ajax({
            type: "GET",
            dataType: "json",
            url: perfilUsuarioUrl + sessionStorage.getItem('usuario').toUpperCase(),
            headers: {
                "token": sessionStorage.token
            },
            success: onSuccessListarMenu,
            error: onErrorListarMenu
        });
    }, 100);
}

function logoff() {
    showLoading();
    $.ajax({
        type: "POST",
        url: logoffUrl,
        contentType: "application/json",
        data: JSON.stringify({ "token": sessionStorage.token }),
        success: function () {
            hideLoading();
            limpaSession();
            $.mobile.back();
        },
        error: function () {
            hideLoading();
            msgServicoIndisponivel(jqXHR, $(".btn-primary").last());
        }
    });
}