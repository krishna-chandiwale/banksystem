package com.bank.app.controller;

import com.bank.app.dto.response.ApiResponse;
import com.bank.app.entity.Beneficiary;
import com.bank.app.repository.BeneficiaryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@CrossOrigin(origins = "*")
public class BeneficiaryController {

    private final BeneficiaryRepository beneficiaryRepository;

    public BeneficiaryController(BeneficiaryRepository beneficiaryRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Beneficiary>>> getBeneficiaries(@RequestParam String email) {
        List<Beneficiary> list = beneficiaryRepository.findByUserEmail(email);
        return ResponseEntity.ok(ApiResponse.ok("Beneficiaries retrieved", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Beneficiary>> addBeneficiary(@RequestBody Beneficiary beneficiary) {
        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        return ResponseEntity.ok(ApiResponse.ok("Beneficiary added successfully", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(@PathVariable Long id) {
        beneficiaryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Beneficiary removed successfully"));
    }
}
