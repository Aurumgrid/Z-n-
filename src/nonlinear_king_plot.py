import numpy as np
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt
import os

def nonlinear_king_plot(delta_nu_b, alpha, beta, gamma, eta):
    """
    Calculates the isotope shift of transition 'a' based on transition 'b'
    using the non-linear King plot formula (Equation 9).
    """
    denominator = 1 + eta * delta_nu_b
    if isinstance(denominator, np.ndarray):
        if np.any(np.abs(denominator) < 1e-9):
            return np.inf
    elif np.abs(denominator) < 1e-9:
        return np.inf
    curvature_term = (gamma * np.power(delta_nu_b, 2)) / denominator
    return alpha * delta_nu_b + beta + curvature_term

def get_quadratic_coefficients(delta_nu_a, delta_nu_b, K_ms_a, F_a, G_a, H_a, K_ms_b, F_b, G_b, H_b):
    """
    Calculates the coefficients A, B, and C for the quadratic equation in mu_ij (Equation 7).
    """
    A = (G_a * F_b - G_b * F_a) + (H_a * K_ms_b - H_b * K_ms_a)
    B = (K_ms_a * F_b - K_ms_b * F_a) + (H_a * delta_nu_b - H_b * delta_nu_a)
    C = delta_nu_a * F_b - delta_nu_b * F_a
    return A, B, C

def solve_for_mu_ij(A, B, C):
    """
    Solves the quadratic equation for mu_ij and returns the physically admissible root (Equation 8).
    Handles the linear case when A is close to zero.
    """
    # Handle the case where the equation is linear (A is close to zero)
    if np.isclose(A, 0):
        if np.isclose(B, 0):
            return np.nan  # Degenerate case, no unique solution
        return -C / B

    discriminant = B**2 - 4 * A * C
    if discriminant < 0:
        return np.nan  # No real solution

    mu_ij = (-B + np.sqrt(discriminant)) / (2 * A)
    return mu_ij

def propagate_to_nuclear_observables(delta_nu_a_data, delta_nu_b_data, fitted_params):
    """
    Demonstrates Step 5.7: Propagation to nuclear observables.
    Uses the fitted parameters to calculate mu_ij and delta<r^2>_ij.
    """
    print("\n--- Step 5.7: Propagation to Nuclear Observables ---")

    # Placeholder atomic constants for demonstration purposes.
    # These are chosen such that A != 0.
    K_ms_a, F_a, G_a, H_a = 1000, 500, 50, 10
    K_ms_b, F_b, G_b, H_b = 950, 480, 40, 8

    mu_ij_values = []
    delta_r2_values = []

    for a, b in zip(delta_nu_a_data, delta_nu_b_data):
        A, B, C = get_quadratic_coefficients(a, b, K_ms_a, F_a, G_a, H_a, K_ms_b, F_b, G_b, H_b)
        mu_ij = solve_for_mu_ij(A, B, C)
        mu_ij_values.append(mu_ij)

        if not np.isnan(mu_ij):
            numerator = a - K_ms_a * mu_ij - G_a * mu_ij**2
            denominator = F_a + H_a * mu_ij
            delta_r2 = numerator / denominator if not np.isclose(denominator, 0) else np.nan
            delta_r2_values.append(delta_r2)
        else:
            delta_r2_values.append(np.nan)

    print("Calculated Nuclear Observables for each data point:")
    print("      mu_ij        delta<r^2>_ij")
    print("-----------------------------------")
    for mu, r2 in zip(mu_ij_values, delta_r2_values):
        if not np.isnan(mu) and not np.isnan(r2):
            print(f"  {mu:12.6f}      {r2:12.6f}")
        else:
            print("  (No real solution for this point)")

def run_demonstration(save_plot=True):
    """
    Performs a demonstration of the non-linear King plot fitting procedure.
    """
    print("--- Running Non-Linear King Plot Demonstration ---")

    true_alpha, true_beta, true_gamma, true_eta = 1.15, 80.0, -0.0015, 0.0005
    delta_nu_b_data = np.linspace(-600, 600, 20)
    true_delta_nu_a = nonlinear_king_plot(delta_nu_b_data, true_alpha, true_beta, true_gamma, true_eta)
    noise = np.random.normal(0, 15, delta_nu_b_data.shape)
    delta_nu_a_data = true_delta_nu_a + noise
    sigma_a = np.full_like(delta_nu_a_data, 15.0)

    initial_guess = [1.0, 50.0, 0, 0]
    popt, pcov = curve_fit(nonlinear_king_plot, delta_nu_b_data, delta_nu_a_data, p0=initial_guess, sigma=sigma_a, absolute_sigma=True)

    perr = np.sqrt(np.diag(pcov))
    print("\n--- Fitting Results ---")
    print(f"True parameters: alpha={true_alpha}, beta={true_beta}, gamma={true_gamma}, eta={true_eta}")
    print(f"Fitted parameters:")
    print(f"  alpha = {popt[0]:.4f} +/- {perr[0]:.4f}")
    print(f"  beta  = {popt[1]:.2f} +/- {perr[1]:.2f}")
    print(f"  gamma = {popt[2]:.6f} +/- {perr[2]:.6f}")
    print(f"  eta   = {popt[3]:.6f} +/- {perr[3]:.6f}")

    if save_plot:
        residuals = delta_nu_a_data - nonlinear_king_plot(delta_nu_b_data, *popt)
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8), gridspec_kw={'height_ratios': [3, 1]})
        ax1.errorbar(delta_nu_b_data, delta_nu_a_data, yerr=sigma_a, fmt='o', label='Synthetic Data', capsize=3)
        x_fit = np.linspace(np.min(delta_nu_b_data), np.max(delta_nu_b_data), 200)
        y_fit = nonlinear_king_plot(x_fit, *popt)
        ax1.plot(x_fit, y_fit, 'r-', label='Non-linear Fit')
        ax1.set_title('Non-linear King Plot Demonstration')
        ax1.set_ylabel('δνᵃ (MHz)')
        ax1.legend()
        ax1.grid(True)
        ax2.errorbar(delta_nu_b_data, residuals, yerr=sigma_a, fmt='o', capsize=3)
        ax2.axhline(0, color='r', linestyle='--')
        ax2.set_xlabel('δνᵇ (MHz)')
        ax2.set_ylabel('Residuals (MHz)')
        ax2.grid(True)
        plt.tight_layout()

        if not os.path.exists('results'):
            os.makedirs('results')
        output_path = 'results/nonlinear_king_plot_fit.png'
        plt.savefig(output_path)
        print(f"\nDiagnostic plot saved to '{output_path}'")

    propagate_to_nuclear_observables(delta_nu_a_data, delta_nu_b_data, popt)

if __name__ == '__main__':
    run_demonstration()