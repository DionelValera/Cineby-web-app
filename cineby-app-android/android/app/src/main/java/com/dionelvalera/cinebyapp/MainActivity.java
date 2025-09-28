package com.dionelvalera.cinebyapp;

import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.widget.FrameLayout;

import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    // Variables para manejar el estado de la pantalla completa del video
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private int originalSystemUiVisibility;
    private int originalOrientation;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Se ejecuta al crear la actividad para inicializar el control del botón de retroceso
        setupOnBackPressedCallback();
    }

    @Override
    public void onStart() {
        super.onStart();

        // 1. CONFIGURACIÓN DEL SOPORTE DE PANTALLA COMPLETA DE VIDEO
        setupFullscreenVideoSupport();

        // 2. CONFIGURACIÓN DEL BLOQUEO DE URLS
        setupUrlBlocking();
    }

    // --- LÓGICA DE RETROCESO MODERNO (CORREGIDA) ---
    private void setupOnBackPressedCallback() {
        // Obtenemos una referencia a la actividad actual (MainActivity.this)
        final MainActivity activity = this;

        OnBackPressedCallback callback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // 1. Obtiene la instancia del WebView
                WebView webView = activity.getBridge().getWebView();

                // 2. Verifica si hay historial de navegación para retroceder
                if (webView.canGoBack()) {
                    // Retrocede una página
                    webView.goBack();
                } else {
                    // 3. Si no hay historial, cierra la actividad para salir de la aplicación
                    // Usar 'finish()' es la forma moderna de cerrar una Activity sin el método deprecated.
                    setEnabled(false);
                    activity.finish(); // CORRECCIÓN CLAVE
                    setEnabled(true);
                }
            }
        };
        // Agrega el callback al dispatcher de la actividad
        getOnBackPressedDispatcher().addCallback(this, callback);
    }

    // --- LÓGICA DE BLOQUEO DE URLS ---

    private void setupUrlBlocking() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }

        WebView webView = getBridge().getWebView();
        final String ALLOWED_DOMAIN = "cineby.app";

        webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {

                String url = request.getUrl().toString();

                return !url.contains(ALLOWED_DOMAIN);
            }
        });
    }

    // --- LÓGICA DE PANTALLA COMPLETA DE VIDEO ---

    private void setupFullscreenVideoSupport() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }

        getBridge().getWebView().setWebChromeClient(new WebChromeClient() {

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    onHideCustomView();
                    return;
                }

                customView = view;
                customViewCallback = callback;

                originalSystemUiVisibility = getWindow().getDecorView().getSystemUiVisibility();
                originalOrientation = getRequestedOrientation();

                getWindow().getDecorView().setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                | View.SYSTEM_UI_FLAG_FULLSCREEN
                );

                getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);

                FrameLayout decor = (FrameLayout) getWindow().getDecorView();
                decor.addView(customView, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT));

                getBridge().getWebView().setVisibility(View.GONE);
            }

            @Override
            public void onHideCustomView() {
                if (customView == null) return;

                getWindow().getDecorView().setSystemUiVisibility(originalSystemUiVisibility);
                getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

                setRequestedOrientation(originalOrientation);

                FrameLayout decor = (FrameLayout) getWindow().getDecorView();
                decor.removeView(customView);

                customView = null;
                if (customViewCallback != null) {
                    customViewCallback.onCustomViewHidden();
                    customViewCallback = null;
                }

                getBridge().getWebView().setVisibility(View.VISIBLE);
            }
        });
    }
}