$(document).on("pageinit", "#pagLogin", function () {

    $("#frmLogin").submit(function (e) {
        e.preventDefault();
        $("body").scrollTop(0);
        login();
    });

    document.getElementById('versao').innerHTML = "v" + versao;

    if (isIphone()) {
        $(".iphone-tollbar").show();
    }
});

function onSuccessVersao(data) {
    if (versao != null) {
        if (data.versao == versao) {
            $.mobile.changePage("pages/menu.html", {
                transition: "slide"
            });
            limparCampos();
        }
        else {
            $('<div>').simpledialog2({
                mode: 'button',
                headerText: 'Aviso',
                headerClose: true,
                buttonPrompt: 'Esta não é a última versão do aplicativo. Entre em contato com a Central de Serviços.',
                buttons: {
                    'OK': {
                        click: function () { }
                    }
                }
            });
        }
    }
}

function login() {
    var usuario = $("#usuario").val();
    var senha = $("#password").val();

    if (usuario && senha) {
        autenticar(usuario, senha);
    } else {
        callbackFail();
    }

}

function autenticar(user, pass) {

    showLoading();
    var varlogin = {
        usuario: user.toUpperCase(),
        senha: pass,
        sigla: sigla
    };

    $.ajax({
        type: "POST",
        url: autenticarUrl,
        contentType: "application/json",
        data: JSON.stringify(varlogin)
    })
    .done(callbackDone)
    .fail(callbackFail)
    .always(function () {
        hideLoading();
    });
}

function callbackDone(data) {
    if (data.token) {
        sessionStorage.usuario = $("#usuario").val();
        sessionStorage.token = data.token;

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: versaoUrl,
            data: JSON.stringify({ "token": sessionStorage.token }),
            headers: {
                "token": sessionStorage.token
            },
            success: onSuccessVersao,
            error: onErrorVersao
        });
    } else {
        callbackFail();

    }
}

function callbackFail(error) {
    $("#usuario").blur();
    $("#password").blur();

    if (!error || error.status == 403) {
        $('<div>').simpledialog2({
            mode: 'button',
            headerText: 'Aviso',
            headerClose: true,
            buttonPrompt: 'Falha na autenticação, tente novamente.',
            buttons: {
                'OK': {
                    click: function () {
                    }
                }
            }
        });
    }
    else {
        msgServicoIndisponivelLogin()
    }
}

function onErrorVersao(error) {
    msgServicoIndisponivelLogin()
}

function limparCampos() {
    $("#usuario").val('');
    $("#password").val('');
}

function msgServicoIndisponivelLogin() {
    $($(".btn-primary").last()).simpledialog2({
        mode: 'button',
        headerText: 'Erro',
        headerClose: false,
        buttonPrompt: 'Serviço indisponível. Tente novamente mais tarde.',
        buttons: {
            'OK': {
                click: function () {
                }
            }
        }
    });
}