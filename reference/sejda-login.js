var inFrame = window != window.top;
($(function () {
  function e(e) {
    const o = " [Error code: " + e.status + "]",
      n = e.responseText;
    var t = "An error occurred. Please try again or contact support." + o;
    return (
      (400 !== e.status && 403 !== e.status) || (t = n || t),
      429 === e.status &&
        (t =
          "Too many login attempts. Please take a break and try again later."),
      t
    );
  }
  function o(e) {
    const o = (e || "").toLowerCase().trim();
    if (o.indexOf("@") < 1) return null;
    for (var n = 0; n < c.length; n++) if (o.endsWith(c[n])) return o;
    return null;
  }
  function n(e) {
    u !== !0 &&
      (e && console.log("Switching login form to SSO"),
      $(".sso-login-elem").toggle(!!e),
      $(".pwd-login-elem").toggle(!e));
  }
  function t() {
    const e = o(f.val());
    return e
      ? e in d
        ? void n(d[e])
        : void $.jsonPost("/users/login-with-sso/lookup", {
            email: e,
            csrf: $("#csrf").val(),
          })
            .done(function (t) {
              ((d[e] = !!t.useSSO), o(f.val()) === e && n(d[e]));
            })
            .fail(function () {})
      : void n(!1);
  }
  function i() {
    (clearTimeout(m), (m = setTimeout(t, 250)));
  }
  function a() {
    (clearTimeout(m), t());
  }
  function r() {
    ($("#google-signin-preload").hide(),
      GoogleApis.loadGSI(function () {
        ($("#google-signin-wrap").show(),
          google.accounts.id.initialize({
            client_id:
              "8721525582-fbt24du8pl38r1ht2ihu9q9vl815o5t8.apps.googleusercontent.com",
            callback: function (o) {
              var n = { id_token: o.credential, csrf: $("#csrf").val() };
              $.jsonPost("/users/login-with-google", n)
                .done(function (e) {
                  inFrame
                    ? (window.parent.userLoggedInHandler(e.email, e.teamMember),
                      window.parent.closeLoginModal())
                    : (window.location.href = "account");
                })
                .fail(function (o, n, t) {
                  const i = e(o);
                  $("#google-signin-wrap").find(".alert").text(i).show();
                });
            },
          }),
          google.accounts.id.renderButton(
            document.getElementById("google-signin2"),
            {
              theme: "outline",
              size: "large",
              scope: "profile email",
              width: 350,
              height: 35,
              longtitle: !0,
            },
          ));
      }));
  }
  inFrame &&
    ($("header").hide(),
    $("footer").hide(),
    $(".logo").hide(),
    $("#closeFrame")
      .show()
      .click(function (e) {
        (e.preventDefault(), parent.closeLoginModal());
      }));
  try {
    const s =
      Intl.DateTimeFormat().resolvedOptions().timeZone +
      " " +
      navigator.language;
    $.cookie("tz_lang", s, { expires: 365, path: "/" });
  } catch (e) {}
  var l = $("#login-form");
  l.submit(function (o) {
    o.preventDefault();
    var n = $(this).serializeJSON();
    if ((l.find(".alert").hide(), !n["cf-turnstile-response"]))
      return (
        l
          .find(".alert")
          .text('Please select the "Verify you are human" checkbox below')
          .show(),
        !1
      );
    var t = l.find("button[type=submit]");
    (t
      .attr("disabled", "disabled")
      .find("i.fa-lock")
      .removeClass("fa-lock")
      .addClass("fa-spinner fa-spin"),
      $.jsonPost("/users/login", n)
        .done(function (e) {
          (Sejda.LocalStorage.setItem("rememberedEmail", n.email),
            inFrame
              ? (window.parent.userLoggedInHandler(n.email, e.teamMember),
                window.parent.closeLoginModal())
              : (window.location.href = "account"));
        })
        .fail(function (o, i, a) {
          t.removeAttr("disabled")
            .find("i.fa-spinner")
            .removeClass("fa-spinner fa-spin")
            .addClass("fa-lock");
          try {
            "undefined" != typeof turnstile && turnstile.reset();
          } catch (e) {}
          const r = o.responseText,
            s = e(o);
          if (403 === o.status && "Email verification required" === r) {
            l.find(".verification-code-group").show();
            const c = l.find("input[name=emailVerificationCode]"),
              d = c.val();
            return (
              c.val(""),
              "" !== d &&
                l.find(".alert").text("Verification code is incorrect").show(),
              void Sejda.EmailVerification.populateCheckInboxLink(n.email, l)
            );
          }
          l.find(".alert").text(s).show();
        })
        .always(function () {}));
  });
  const c = window.ssoSuffixes || [],
    d = {};
  var u = !1;
  const f = l.find("[name=email]"),
    g = l.find("[name=password]");
  var m = null;
  (f.on("input", i),
    f.on("blur", a),
    g.on("focus", a),
    $(".switch-use-pwd a").click(function () {
      ((u = !0), $(".pwd-login-elem").show(), $(".sso-login-elem").hide());
    }),
    f.trigger("keyup input").focus());
  const p = Sejda.LocalStorage.getItem("rememberedEmail");
  (p && (f.val() || f.val(p).trigger("keyup input")),
    $(".btn-login-sso").click(function () {
      console.log("Performing SSO");
      const o = l.serializeJSON();
      return (
        Sejda.LocalStorage.setItem("rememberedEmail", o.email),
        o["cf-turnstile-response"]
          ? void $.jsonPost("/users/login-with-sso", o)
              .done(function (e) {
                inFrame
                  ? window.open(e.ssoUrl, "_blank")
                  : (window.location.href = e.ssoUrl);
              })
              .fail(function (o, n, t) {
                const i = e(o);
                l.find(".alert").text(i).show();
              })
          : (l
              .find(".alert")
              .text('Please select the "Verify you are human" checkbox below')
              .show(),
            !1)
      );
    }),
    $("#msft-signin2").click(function () {
      loadScript(
        "https://alcdn.msftauth.net/lib/1.2.1/js/msal.js",
        function () {
          const o = {
              auth: {
                clientId: "fcd5a3f1-9bed-44f2-8eb8-84483c69b9e2",
                authority: "https://login.microsoftonline.com/common",
                redirectUri: [
                  window.location.protocol,
                  "//",
                  window.location.host,
                  "/one-drive-auth",
                ].join(""),
              },
              cache: {
                cacheLocation: "sessionStorage",
                storeAuthStateInCookie: !1,
              },
            },
            n = new Msal.UserAgentApplication(o);
          n.loginPopup({
            scopes: ["openid", "profile", "email"],
            prompt: "select_account",
            redirectUri: [
              window.location.protocol,
              "//",
              window.location.host,
              "/one-drive-auth",
            ].join(""),
          })
            .then(function (o) {
              const t = o.account.userName;
              return t && t.toLowerCase().endsWith("@gmail.com")
                ? void $("#msft-signin-wrap")
                    .find(".alert")
                    .text(
                      s_i18n(
                        "It looks like you have a Google account. Please use the Sign in with Google button instead.",
                      ),
                    )
                    .show()
                : void n
                    .acquireTokenSilent({
                      scopes: ["openid", "profile", "email"],
                      account: o.account,
                    })
                    .then(function (o) {
                      const n = o.idToken.rawIdToken;
                      var t = { id_token: n, csrf: $("#csrf").val() };
                      $.jsonPost("/users/login-with-microsoft", t)
                        .done(function (e) {
                          inFrame
                            ? (window.parent.userLoggedInHandler(
                                e.email,
                                e.teamMember,
                              ),
                              window.parent.closeLoginModal())
                            : (window.location.href = "account");
                        })
                        .fail(function (o, n, t) {
                          const i = e(o);
                          $("#msft-signin-wrap").find(".alert").text(i).show();
                        });
                    })
                    .catch(function (e) {
                      console.error(e);
                    });
            })
            .catch(function (e) {
              console.error(e);
            });
        },
      );
    }),
    Sejda.OptOutChoices.noGoogle()
      ? $(".btn-login-google-preload").click(function () {
          Sejda.OptOutChoices.askGoogle().then(function () {
            r();
          });
        })
      : r());
}),
  forceHttps());
